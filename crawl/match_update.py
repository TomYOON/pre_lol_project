## import
import urllib.request
from bs4 import BeautifulSoup
import demjson
import time
from pprint import pprint
import datetime
from bson import ObjectId
from pymongo import MongoClient 
import setting
from collections import defaultdict


## Function
def get_page_code(month=1):
    month = str(month)
    if len(month) < 2:
        month = '0' + month
    url = 'https://sports.news.naver.com/esports/schedule/index.nhn?year=2021&leagueCode=lck_2021_spring&month={}&category=lol'.format(month)
    soup =  BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    return str(soup)

def get_schedule_dic(str_soup):
    target_str = '"monthlyScheduleDailyGroup":'
    idx = str_soup.index(target_str) + len(target_str)
    monthly_schedule = str_soup[idx:]

    count = 1 ## 처음 { 를 스택에 넣는다고 가정
    left = '['
    right = ']'
    last_idx = 1
    for c in monthly_schedule[1:]:
        if c == right:
            count -= 1
        elif c == left:
            count += 1
        last_idx += 1
        if count == 0:
            break
    js_object = "{"+target_str+monthly_schedule[:last_idx]+"}"
    return demjson.decode(js_object)

# needed_key = ['homeTeamName', 'awayTeamName','homeTeamScore','awayTeamScore','homeTeamEmblem64URI','awayTeamEmblem64URI','gameStartDate','gameStartTime','state']
def customize_schedules(schedule_list:list):
    customized_list = []
    team_map_dic = {'DRX': 'drx', 'KT': 'kt', 'T1': 't1', '농심': 'nongsim', '담원 기아': 'dk', '리브 샌박': 'liv', '아프리카': 'afreeca', '젠지': 'geng', '프레딧': 'predit', '한화생명': 'hanwha'}
    for data in schedule_list:  
        if not data['empty']:
            schedule_data = data['scheduleList']
            for schedule in schedule_data:
                temp_dic = dict()
                temp_dic['homeTeamName'] = schedule['homeTeamName']
                temp_dic['awayTeamName'] = schedule['awayTeamName']
                
                temp_dic['homeTeamScore'] = schedule['homeTeamScore']
                temp_dic['awayTeamScore'] = schedule['awayTeamScore']
                
                temp_dic['gameStartDate'] = schedule['gameStartDate']
                temp_dic['gameStartTime'] = schedule['gameStartTime']
                temp_dic['gameStatus'] = schedule['gameStatus']
                
                temp_dic['homeTeamCode'] = team_map_dic[schedule['homeTeamName']]
                temp_dic['awayTeamCode'] = team_map_dic[schedule['awayTeamName']]
                
                temp_dic['homeTeamVotes'] = 0
                temp_dic['awayTeamVotes'] = 0
                customized_list.append(temp_dic)
    return customized_list

def calc_win_point(home_votes, away_votes, win_team):
    point = 10 #최소 포인트
    if home_votes == away_votes: #zero division 방지
        return 50
    if win_team == 'home':
        point = max(int(round(away_votes / (away_votes + home_votes), 2) * 100), point) #최대 100점 적은 투표를 받은 팀을 맞추면 더 점수를 받음
    else:
        point = max(int(round(home_votes / (away_votes + home_votes), 2) * 100), point)
    return point

def get_winner(match):
#     print(match['homeTeamScore'], match['awayTeamScore'])
    if match['homeTeamScore'] > match['awayTeamScore']:
        return 'home'
    return 'away'

def update_before_data():
    month = datetime.date.today().month
    str_soup = get_page_code(month= month)
    schedule_dic = get_schedule_dic(str_soup)
    schedule_list = schedule_dic["monthlyScheduleDailyGroup"]
    ## 크롤링된 데이터
    customized_list = customize_schedules(schedule_list)

    ## connect db
    client = MongoClient(setting.LOL_MONGO_URL)
    db = client['prepro-lol']
    matches = db.matches

    now = datetime.datetime.now()
    today = now.strftime("%Y-%m-%d")
    ## 디비에서 불러온 데이터
    before_list = list(matches.find({"gameStartDate": {"$lte":today}, "gameStatus":'BEFORE'}))
    before_list.sort(key=lambda x:(x["gameStartDate"], x["gameStartTime"])) #시간대로 정렬

    status_changed_list = [] # 게임 상태가 바뀐 경기 - before -> result
    score_changed_list = [] # 현재 진행중이어서 게임 점수만 바뀐 경기
    idx = 0

    for match in before_list:
        while not (customized_list[idx]["gameStartDate"] == match["gameStartDate"] 
        and customized_list[idx]["gameStartTime"] == match["gameStartTime"]): #db에서 불러온 경기와 크롤링한 경기 일치 시키기
            idx += 1
            if idx > len(customized_list):
                break #오류 상황
                
        if customized_list[idx]["gameStatus"] == "RESULT": # 경기가 끝난 경우
            win_team = get_winner(customized_list[idx])
            point = calc_win_point(match['homeTeamVotes'], match['awayTeamVotes'], win_team)
            customized_list[idx]['win_team'] = win_team
            customized_list[idx]['point'] = point
            customized_list[idx]['_id'] = str(match['_id'])
            status_changed_list.append(customized_list[idx])
        elif customized_list[idx]["homeTeamScore"] != match['homeTeamScore'] \
        or customized_list[idx]["awayTeamScore"] != match['awayTeamScore']: # 점수만 바뀐 경우
            customized_list[idx]['_id'] = str(match['_id'])
            score_changed_list.append(customized_list[idx])

    votes_schema = db.votes
    votes_list = [] # 유저의 투표리스트
    for match in status_changed_list:
        votes_list += list(votes_schema.find({"matchId": match['_id']}))  

    votes_list.sort(key=lambda x:x['matchId'])  # mapping을 위해 matchId로 정렬
    status_changed_list.sort(key=lambda x:x['_id'])

    user_score_dict = defaultdict(int) # 투표에서 얻은 점수를 유저별로 기록. TODO: 추후에 불러온 데이터가 많아지면 작은 단위로 수정해야함

    i, j = 0, 0
    while i < len(status_changed_list) and j < len(votes_list):
        if status_changed_list[i]['_id'] > str(votes_list[j]['matchId']):
            j += 1
        elif status_changed_list[i]['_id'] < str(votes_list[j]['matchId']):
            i += 1
        else: #같은경우
            date, time = status_changed_list[i]['gameStartDate'], status_changed_list[i]['gameStartTime']
            point, match_id = status_changed_list[i]['point'], status_changed_list[i]['_id']
            win_team = status_changed_list[i]['win_team']
            votes_list[j]['processed'] = True
            match_date = datetime.datetime.strptime("{} {}".format(date, time), '%Y-%m-%d %H:%M')
            if votes_list[j]['createdAt'] < match_date: #경기 시작전에 투표한 것만 인정, 부정입력방지
                print(point, match_id)
                if votes_list[j]['voteTo'] != win_team:
                    print(votes_list[j]['voteTo'],win_team)
                    point -= 100

                votes_list[j]['point'] = point
                user_score_dict[votes_list[j]['userId']] += point
            j += 1

    # TODO: 트랜잭션 처리
    for vote in votes_list: # 투표 저장
        votes_schema.update_one({'_id': ObjectId(vote["_id"])},{ '$set':{'processed': vote['processed'], 'point':vote['point']}})
    
    for match in status_changed_list: # 경기 저장 (결과 업데이트)
        matches.update_one({'_id': ObjectId(match['_id'])}, { '$set':{'homeTeamScore': match['homeTeamScore'], 'gameStatus':match['gameStatus']}})
    
    for match in score_changed_list: # 점수만 바뀐 경기 저장 (점수 업데이트)
        matches.update_one({'_id': ObjectId(match['_id'])}, { '$set':{'homeTeamScore': match['homeTeamScore']}})

def recursive_func_with_delay(sec, func):
    func()
    print("function excuted")
    time.sleep(sec)
    recursive_func_with_delay(sec, func)

if __name__ == "__main__":
    today = datetime.datetime.now()
    update_time = datetime.datetime(today.year, today.month, today.day,23, 59, 59) # 밤 12시에 실행
    diff = update_time - today
    diff_sec = diff.seconds
    time.sleep(diff_sec)
    day_sec = 60 * 60 * 24 # 매일 실행
    recursive_func_with_delay(day_sec, update_before_data)
