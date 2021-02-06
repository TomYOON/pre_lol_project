//query selector
const outputDiv = document.querySelector('.output');
const container = document.querySelector('.vote__container');
const rightBtn = document.querySelector('.right__button');
const leftBtn = document.querySelector('.left__button');
const matchDay = document.querySelector('.match__day');
const voteBtn = document.querySelector('.voteSubmit__btn');
const alertSpan = document.querySelector('.alert__msg');

//event
rightBtn.addEventListener('click', getNextMatch);
leftBtn.addEventListener('click', getPrevMatch);
voteBtn.addEventListener('click', submitVote);
// document.addEventListener('DOMContentLoaded', () => {
//   fetchMatch(new Date());
// });

//global variable
let matches = [];
let curIdx = 0;
let matchPerDay = 2;

//onload function
/** @return {None} */
function processMatch(match) {
  matches.push(mapMatchDay(match));
  viewThisWeekMatch();
}

//build html fuction
/** @return {String} */
function buildVoteForm(htmlStr) {
  return `<form method="post" action='/vote' name="voteSubmit" class="vote__form">
  ${htmlStr}
  <input type="button" value="투표하기" class="voteSubmit__btn"/>`;
}

/** @return {String} */
function biuldMatchHtml(match) {
  const dateValid =
    match.userVote != '' ||
    dateValidCheck(match.gameStartDate, match.gameStartTime)
      ? ''
      : 'disabled';

  const htmlString = `
  <label class="left__team ${match.userVote == 'home' ? 'voted' : ''}">
  <input type="radio" name=${
    match._id
  } id="vote__input" value='home' class="match__ladioBtn" ${dateValid}/>
    <img src="/images/${match.homeTeamCode}.png" alt="team logo" />
    <span class="team__name">${match.homeTeamName}</span>
    <span class="votes">${match.homeTeamVotes}표</span>
  </label>
  <span class="vs">VS</span>
  <label class="right__team ${match.userVote == 'away' ? 'voted' : ''}">
    <span class="votes">${match.awayTeamVotes}표</span>
    <span class="team__name">${match.awayTeamName}</span>
    <img src="/images/${match.awayTeamCode}.png" alt="team logo" />
    <input type="radio" name=${
      match._id
    } id="vote__input" value='away' class="match__ladioBtn" ${dateValid}/>
  </label>
  `;
  return htmlString;
}

// fetch function
/** @return {Array<object>} */
async function fetchMatch(date) {
  console.log(date);
  const data = await fetch(`/match?date=${formatDate(date)}`).then((res) =>
    res.json()
  );
  return data;
}

/** @return {Array<object>} */
async function fetchVote(votes) {
  console.log(votes);
  let data = await fetch('/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(votes),
  }).then((res) => res.json());
  return data;
}

// process match function
/** @return {Array<object>} */
function mapMatchDay(matches) {
  if (matches.length < 1) return;

  /** match를 시간순으로 정렬 */
  matches.sort((a, b) =>
    a.gameStartDate > b.gameStartDate
      ? 1
      : a.gameStartDate === b.gameStartDate
      ? a.gameStartTime > b.gameStartTime
        ? 1
        : -1
      : -1
  );

  let curDate = matches[0].gameStartDate;
  let mapedArr = [];
  let dateArr = []; //날짜가 같은 경기를 담을 배열

  for (let i = 0; i < matches.length; i++) {
    if (matches[i].gameStartDate == curDate) {
      dateArr.push(matches[i]);
    } else {
      curDate = matches[i].gameStartDate;
      mapedArr.push(dateArr);
      dateArr = [matches[i]];
    }
  }
  mapedArr.push(dateArr);
  return mapedArr;
}

/** @return {bool} */
function dateValidCheck(matchDate, matchTime) {
  const today = new Date();
  const date = formatDate(today);
  const curHour = today.getHours();
  let isOverTime = true;

  if (matchDate < date) {
    isOverTime = false;
  } else if (matchDate == date) {
    if (parseInt(matchTime.substring(0, 2)) <= curHour) {
      isOverTime = false;
    }
  }

  return isOverTime;
}

/** @return {None} */
function getDay(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const dayArr = ['일', '월', '화', '수', '목', '금', '토'];
  return dayArr[day];
}
/** @return {bool} */
function viewThisWeekMatch() {
  container.innerHTML = '';

  const curMatches = matches[curIdx];
  for (const dayMappedMatch of curMatches) {
    const matchDiv = document.createElement('div');
    const dateSpan = document.createElement('span');
    matchDiv.classList.add('day__match');
    dateSpan.innerHTML = `${dayMappedMatch[0].gameStartDate} (${getDay(
      dayMappedMatch[0].gameStartDate
    )})`;
    matchDiv.appendChild(dateSpan);

    for (const match of dayMappedMatch) {
      const matchLi = document.createElement('li');
      matchLi.classList.add('match__list');
      if (
        match.userVote != '' ||
        !dateValidCheck(match.gameStartDate, match.gameStartTime)
      ) {
        matchLi.classList.add('ended__match');
      }

      const htmlString = biuldMatchHtml(match);
      matchLi.innerHTML = htmlString;
      matchDiv.appendChild(matchLi);
    }
    container.appendChild(matchDiv);
  }
}

/** @return {String} */
function formatDate(date) {
  if (typeof date == typeof new Date()) {
    return date.toISOString().substring(0, 10);
  }
  return date.substring(0, 10);
}

// button listener function
/** @return {None} */
async function getNextMatch() {
  leftBtn.disabled = false;
  alertSpan.innerHTML = '';
  console.log(matches[curIdx][0][0].gameStartDate);
  if (curIdx === matches.length - 1) {
    const curDate = new Date(matches[curIdx][0][0].gameStartDate);
    curDate.setDate(curDate.getDate() + 7);
    console.log(123, curDate);
    const matchArr = await fetchMatch(curDate);
    if (matchArr.length > 0) {
      matches.push(mapMatchDay(matchArr));
      curIdx++;
    } else {
      alertSpan.innerHTML = '경기가 없습니다.';
      rightBtn.disabled = true;
    }
  } else {
    curIdx++;
  }
  viewThisWeekMatch();
}

/** @return {None}*/
async function getPrevMatch() {
  alertSpan.innerHTML = '';
  rightBtn.disabled = false;
  console.log(matches[curIdx][0][0].gameStartDate);
  if (curIdx === 0) {
    const curDate = new Date(matches[curIdx][0][0].gameStartDate);
    curDate.setDate(curDate.getDate() - 7);
    console.log(123, curDate);
    const matchArr = await fetchMatch(curDate);
    if (matchArr.length > 0) {
      // matches.push(mapMatchDay(matchArr));
      matches.splice(0, 0, mapMatchDay(matchArr));
    } else {
      alertSpan.innerHTML = '경기가 없습니다.';
      leftBtn.disabled = true;
    }
  } else {
    curIdx--;
  }
  viewThisWeekMatch();
}

/** @return {None} */
async function submitVote(event) {
  event.preventDefault();
  const votes = {};
  const form = document.voteSubmit;
  for (const dayMatch of matches[curIdx]) {
    for (const match of dayMatch) {
      let elements = document.getElementsByName(match._id);
      if (elements[0].checked) {
        votes[match._id] = elements[0].value;
      } else if (elements[1].checked) {
        votes[match._id] = elements[1].value;
      }
    }
  }
  if (votes) {
    const data = await fetchVote(votes);
    console.log(data);
    if (data.status == 'login') {
      alert('로그인이 필요합니다.');
    } else if (data.status == 'OK') {
      const votedArr = data.voted;

      for (const dayMatch of matches[curIdx]) {
        for (const match of dayMatch) {
          if (checkVoteId(match._id, votedArr)) {
            const votedTeam = votes[match._id];
            match.userVote = votedTeam;
            match[`${votedTeam}TeamVotes`]++;
          }
        }
      }
      viewThisWeekMatch();
    }
  } else {
    alert('한 개 이상 투표하셔야 합니다!');
  }
}

/** @return {Bool} */
function checkVoteId(id, votes) {
  for (const vote of votes) {
    if (id == vote) {
      return true;
    }
  }
  return false;
}
