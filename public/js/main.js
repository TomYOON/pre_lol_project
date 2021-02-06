//query selector
const outputDiv = document.querySelector('.output');
const container = document.querySelector('.vote__container');
const rightBtn = document.querySelector('.right__button');
const leftBtn = document.querySelector('.left__button');
const matchDay = document.querySelector('.match__day');
const voteBtn = document.querySelector('.voteSubmit__btn');
const alertSpan = document.querySelector('.alert__msg');

//event
// document.addEventListener('DOMContentLoaded', () => {
//   fetchMatch(new Date());
// });
rightBtn.addEventListener('click', getNextMatch);
leftBtn.addEventListener('click', getPrevMatch);
voteBtn.addEventListener('click', submitVote);

//global variable
let matches = [];
let curIdx = 0;
let matchPerDay = 2;

function test(match) {
  matches.push(mapMatchDay(match));
  viewThisWeekMatch();
}
function buildVoteForm(htmlStr) {
  return `<form method="post" action='/vote' name="voteSubmit" class="vote__form">
  ${htmlStr}
  <input type="button" value="투표하기" class="voteSubmit__btn"/>`;
}

function biuldMatchHtml(match) {
  const dateValid = dateValidCheck(match.gameStartDate, match.gameStartTime)
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

async function fetchMatch(date) {
  console.log(date);
  const data = await fetch(`/match?date=${formatDate(date)}`).then((res) =>
    res.json()
  );
  return data;
}

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

function mapMatchDay(matches) {
  if (matches.length < 1) return;
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
  let ret = [];
  let dateArr = [];
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].gameStartDate == curDate) {
      dateArr.push(matches[i]);
    } else {
      curDate = matches[i].gameStartDate;
      ret.push(dateArr);
      dateArr = [matches[i]];
    }
  }
  ret.push(dateArr);
  return ret;
}

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
function dateValidCheck(matchDate, matchTime) {
  const today = new Date();
  const date = formatDate(today);
  const curHour = today.getHours();
  let ret = true;
  if (matchDate < date) {
    ret = false;
  } else if (matchDate == date) {
    if (parseInt(matchTime.substring(0, 2)) <= curHour) {
      ret = false;
    }
  }

  return ret;
}

function getDay(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const dayArr = ['일', '월', '화', '수', '목', '금', '토'];
  return dayArr[day];
}
function viewThisWeekMatch() {
  container.innerHTML = '';

  const curMatches = matches[curIdx];
  for (const dayMappedMatch of curMatches) {
    const dateValid = dateValidCheck(
      dayMappedMatch[0].gameStartDate,
      dayMappedMatch[0].gameStartTime
    );

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
      if (!dateValidCheck(match.gameStartDate, match.gameStartTime)) {
        matchLi.classList.add('ended__match');
      }

      const htmlString = biuldMatchHtml(match);
      matchLi.innerHTML = htmlString;
      matchDiv.appendChild(matchLi);
    }
    container.appendChild(matchDiv);
  }
}

function formatDate(date) {
  if (typeof date == typeof new Date()) {
    return date.toISOString().substring(0, 10);
  }
  return date.substring(0, 10);
}

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
    // console.log(votes);
    // form.submit();
    const data = await fetchVote(votes);
    console.log(data);
    if (data.status == 'login') {
      alert('로그인이 필요합니다.');
    } else if (data.status == 'OK') {
      const votedArr = data.voted;
      // console.log(voted);

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

function checkVoteId(id, votes) {
  for (const vote of votes) {
    if (id == vote) {
      return true;
    }
  }
  return false;
}

// function viewTodayMatch(date) {
//   const curDate = formatDate(date);
//   let matchOfDayCount = 0;
//   for (const match of matches) {
//     console.log(curDate, match.gameStartDate);
//     if (match.gameStartDate === curDate) {
//       const matchLi = document.createElement('li');
//       matchLi.classList.add('match__list');

//       const htmlString = biuldMatchHtml(match);

//       matchLi.innerHTML = htmlString;
//       container.appendChild(matchLi);
//       if (++matchOfDayCount == matchPerDay) {
//         break;
//       }
//     }
//     curIdx++;
//     console.log(curIdx);
//   }

//   if (matchOfDayCount == 0) {
//     //오늘 매치가 없을 경우
//     curIdx = -1;
//     getNextMatch();
//   }
// }

// function getNextMatch() {
//   if (matches.length < curIdx + matchPerDay) {
//     let date = new Date(matches[matches.length - 1].gameStartDate);
//     date.setDate(date.getDate() + 7); //다음주

//     fetchMatch(date);
//     return;
//   }

//   container.innerHTML = '';
//   leftBtn.disabled = false;
//   for (let i = 0; i < matchPerDay; i++) {
//     const matchLi = document.createElement('li');
//     matchLi.classList.add('match__list');
//     const match = matches[++curIdx];
//     matchDay.innerHTML = match.gameStartDate;
//     const htmlString = biuldMatchHtml(match);
//     matchLi.innerHTML = htmlString;
//     container.appendChild(matchLi);
//   }
// }

// function getPrevMatch() {
//   const minusIdx = matchPerDay * 2; //현재 인덱스에서 하루 매치의 2배를 뒤로가서 ++하는 방식으로 보여줌
//   if (curIdx - minusIdx < 0) {
//     let date = new Date(matches[0].gameStartDate);
//     date.setDate(date.getDate() - 7);
//     fetchMatch(date, false);
//     return;
//   }
//   rightBtn.disabled = false;
//   container.innerHTML = '';
//   curIdx -= minusIdx;
//   for (let i = 0; i < matchPerDay; i++) {
//     const matchLi = document.createElement('li');
//     matchLi.classList.add('match__list');
//     const match = matches[++curIdx];
//     matchDay.innerHTML = match.gameStartDate;
//     const htmlString = biuldMatchHtml(match);
//     matchLi.innerHTML = htmlString;
//     container.appendChild(matchLi);
//   }
// }
