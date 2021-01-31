//query selector
const outputDiv = document.querySelector('.output');
const testBtn = document.querySelector('.test');
const container = document.querySelector('.vote__container');
const rightBtn2 = document.querySelector('.right__button');
const leftBtn2 = document.querySelector('.left__button');
// const matchDay2 = document.querySelector('.match__day');

//event
testBtn.addEventListener('click', () => {
  testFetch(new Date());
});
rightBtn2.addEventListener('click', getNextMatch);
leftBtn2.addEventListener('click', getPrevMatch);

//global variable
let matches = [];
let curIdx = 0;

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
  <div class="right__team ${match.userVote == 'away' ? '"voted"' : ''}">
    <span class="votes">${match.awayTeamVotes}</span>
    <span class="team__name">${match.awayTeamName}</span>
    <img src="/images/${match.awayTeamCode}.png" alt="team logo" />
    <input type="radio" name=${
      match._id
    } id="vote__input" value='away' class="match__ladioBtn"/>
  </div>`;
  return htmlString;
}

function testFetch(date, next = true) {
  fetch(`/rank/test2?date=${formatDate(date)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length < 1) {
        const span = document.createElement('span');
        span.innerHTML = '경기가 없습니다.';
        container.appendChild(span);
        if (next) {
          rightBtn2.disabled = true;
        } else {
          leftBtn2.disabled = true;
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
      if (++matchOfDayCount == 2) {
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
  if (matches.length < curIdx + 2) {
    let date = new Date(matches[matches.length - 1].gameStartDate);
    date.setDate(date.getDate() + 7); //다음주
    testFetch(date);
    return;
  }

  container.innerHTML = '';
  leftBtn2.disabled = false;
  for (let i = 0; i < 2; i++) {
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
  if (curIdx - 4 < 0) {
    let date = new Date(matches[0].gameStartDate);
    date.setDate(date.getDate() - 7);
    testFetch(date, false);
    return;
  }
  rightBtn2.disabled = false;
  container.innerHTML = '';
  curIdx -= 4;
  for (let i = 0; i < 2; i++) {
    const matchLi = document.createElement('li');
    matchLi.classList.add('match__list');
    const match = matches[++curIdx];
    matchDay.innerHTML = match.gameStartDate;
    const htmlString = biuldMatchHtml(match);
    matchLi.innerHTML = htmlString;
    container.appendChild(matchLi);
  }
}
