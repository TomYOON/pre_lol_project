const outputDiv = document.querySelector('.output');
const testBtn = document.querySelector('.test');
const container = document.querySelector('.vote__container');
const rightBtn2 = document.querySelector('.right__button');
const leftBtn2 = document.querySelector('.left__button');

testBtn.addEventListener('click', testFetch);
rightBtn2.addEventListener('click', getNextMatch);
leftBtn2.addEventListener('click', getPrevMatch);

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
function testFetch() {
  fetch('/rank/test2')
    .then((res) => res.json())
    .then((data) => {
      if (data.length < 1) {
        const span = document.createElement('span');
        span.innerHTML = '이번 주는 경기가 없습니다.';
        container.appendChild(span);
        return;
      }
      Array.prototype.push.apply(matches, data);
      viewTodayMatch(new Date());
      // data.forEach((match) => {
      //   const matchLi = document.createElement('li');
      //   matchLi.classList.add('match__list');

      //   const input = `
      // <div class="left__team ${match.userVote == 'home' ? 'voted' : ''}">
      // <input type="radio" name=${
      //   match._id
      // } id="vote__input" value='home' class="match__ladioBtn"/>
      //   <img src="/images/${match.homeTeamCode}.png" alt="team logo" />
      //   <span class="team__name">${match.homeTeamName}</span>
      //   <span class="votes">${match.homeTeamVotes}</span>
      // </div>
      // <span class="vs">VS</span>
      // <div class="right__team ${match.userVote == 'away' ? '"voted"' : ''}">
      //   <span class="votes">${match.awayTeamVotes}</span>
      //   <span class="team__name">${match.awayTeamName}</span>
      //   <img src="/images/${match.awayTeamCode}.png" alt="team logo" />
      //   <input type="radio" name=${
      //     match._id
      //   } id="vote__input" value='away' class="match__ladioBtn"/>
      // </div>`;

      //   matchLi.innerHTML = input;
      //   container.appendChild(matchLi);
      // });
    });
}

function viewTodayMatch(date) {
  const curDate = date.toISOString().substring(0, 10);
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
}

function getNextMatch() {
  container.innerHTML = '';

  for (let i = 0; i < 2; i++) {
    const matchLi = document.createElement('li');
    matchLi.classList.add('match__list');
    const match = matches[++curIdx];
    const htmlString = biuldMatchHtml(match);
    matchLi.innerHTML = htmlString;
    container.appendChild(matchLi);
  }
}

function getPrevMatch() {
  container.innerHTML = '';
  for (let i = 0; i < 2; i++) {
    const matchLi = document.createElement('li');
    matchLi.classList.add('match__list');
    const match = matches[--curIdx];
    const htmlString = biuldMatchHtml(match);
    matchLi.innerHTML = htmlString;
    container.appendChild(matchLi);
  }
}
