//query selector
const outputDiv = document.querySelector('.output');
const container = document.querySelector('.vote__container');
const rightBtn = document.querySelector('.right__button');
const leftBtn = document.querySelector('.left__button');
const matchDay = document.querySelector('.match__day');
const voteBtn = document.querySelector('.voteSubmit__btn');

//event
document.addEventListener('DOMContentLoaded', () => {
  fetchMatch(new Date());
});
rightBtn.addEventListener('click', getNextMatch);
leftBtn.addEventListener('click', getPrevMatch);
voteBtn.addEventListener('click', submitVote);

//global variable
let matches = [];
let curIdx = 0;
let matchPerDay = 2;

function buildVoteForm(htmlStr) {
  return `<form method="post" action='/vote' name="voteSubmit" class="vote__form">
  ${htmlStr}
  <input type="button" value="투표하기" class="voteSubmit__btn"/>`;
}

function biuldMatchHtml(match) {
  const htmlString = `
  <div class="left__team ${match.userVote == 'home' ? 'voted' : ''}">
  <input type="radio" name=${
    match._id
  } id="vote__input" value='home' class="match__ladioBtn"/>
    <img src="/images/${match.homeTeamCode}.png" alt="team logo" />
    <span class="team__name">${match.homeTeamName}</span>
    <span class="votes">${match.homeTeamVotes}</span>
  </div>
  <span class="vs">VS</span>
  <div class="right__team ${match.userVote == 'away' ? 'voted' : ''}">
    <span class="votes">${match.awayTeamVotes}</span>
    <span class="team__name">${match.awayTeamName}</span>
    <img src="/images/${match.awayTeamCode}.png" alt="team logo" />
    <input type="radio" name=${
      match._id
    } id="vote__input" value='away' class="match__ladioBtn"/>
  </div>
  `;
  return htmlString;
}

function fetchMatch(date, next = true) {
  fetch(`/match?date=${formatDate(date)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length < 1) {
        const span = document.createElement('span');
        span.innerHTML = '경기가 없습니다.';
        container.appendChild(span);
        if (next) {
          rightBtn.disabled = true;
        } else {
          leftBtn.disabled = true;
        }
        return;
      }
      if (matches.length == 0) {
        //첫 로드일 때
        Array.prototype.push.apply(matches, data);
        viewTodayMatch(new Date());
      } else {
        if (next) {
          Array.prototype.push.apply(matches, data);
          getNextMatch();
        } else {
          curIdx = data.length + 1;
          Array.prototype.push.apply(data, matches);
          matches = data;
          getPrevMatch();
          console.log(matches, curIdx);
        }
      }
    });
}

function formatDate(date) {
  if (typeof date == typeof new Date()) {
    return date.toISOString().substring(0, 10);
  }
  return date.substring(0, 10);
}

function viewTodayMatch(date) {
  const curDate = formatDate(date);
  let matchOfDayCount = 0;
  for (const match of matches) {
    console.log(curDate, match.gameStartDate);
    if (match.gameStartDate === curDate) {
      const matchLi = document.createElement('li');
      matchLi.classList.add('match__list');

      const htmlString = biuldMatchHtml(match);

      matchLi.innerHTML = htmlString;
      container.appendChild(matchLi);
      if (++matchOfDayCount == matchPerDay) {
        break;
      }
    }
    curIdx++;
    console.log(curIdx);
  }

  if (matchOfDayCount == 0) {
    //오늘 매치가 없을 경우
    curIdx = -1;
    getNextMatch();
  }
}

function getNextMatch() {
  if (matches.length < curIdx + matchPerDay) {
    let date = new Date(matches[matches.length - 1].gameStartDate);
    date.setDate(date.getDate() + 7); //다음주

    fetchMatch(date);
    return;
  }

  container.innerHTML = '';
  leftBtn.disabled = false;
  for (let i = 0; i < matchPerDay; i++) {
    const matchLi = document.createElement('li');
    matchLi.classList.add('match__list');
    const match = matches[++curIdx];
    matchDay.innerHTML = match.gameStartDate;
    const htmlString = biuldMatchHtml(match);
    matchLi.innerHTML = htmlString;
    container.appendChild(matchLi);
  }
}

function getPrevMatch() {
  const minusIdx = matchPerDay * 2; //현재 인덱스에서 하루 매치의 2배를 뒤로가서 ++하는 방식으로 보여줌
  if (curIdx - minusIdx < 0) {
    let date = new Date(matches[0].gameStartDate);
    date.setDate(date.getDate() - 7);
    fetchMatch(date, false);
    return;
  }
  rightBtn.disabled = false;
  container.innerHTML = '';
  curIdx -= minusIdx;
  for (let i = 0; i < matchPerDay; i++) {
    const matchLi = document.createElement('li');
    matchLi.classList.add('match__list');
    const match = matches[++curIdx];
    matchDay.innerHTML = match.gameStartDate;
    const htmlString = biuldMatchHtml(match);
    matchLi.innerHTML = htmlString;
    container.appendChild(matchLi);
  }
}

function submitVote(event) {
  // event.preventDefault();
  console.log('sdf');
}
