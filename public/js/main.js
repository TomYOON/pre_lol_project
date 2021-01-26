//global variable
let curDay = new Date();
const matchList = document.querySelectorAll('.match__list');
const matchPerDay = 2;
//Selectors
const rightButton = document.querySelector('.right__button');
const leftButton = document.querySelector('.left__button');
const matchDay = document.querySelector('.match__day');

document.addEventListener('DOMContentLoaded', () => {
  getMatch();
});
rightButton.addEventListener('click', () => {
  addDay(1);
});
leftButton.addEventListener('click', () => {
  addDay(-1);
});

function formatDate(date) {
  return date.toISOString().substring(0, 10);
}

function getMatch(day = 1) {
  let index = 0;
  let count = 0;
  hasMatch = false;
  while (matchList.length > 0 && !hasMatch) {
    //매치가 있는데 오늘 매치가 없으면 다음매치까지 찾음
    matchList.forEach((match) => {
      const formattedDay = formatDate(curDay);
      const date = match.querySelector('.match__date');
      if (date.textContent === formattedDay) {
        match.style.display = 'flex';
        hasMatch = true;
        if (date.textContent === formatDate(new Date())) {
          matchDay.innerHTML = '오늘의 경기';
        } else {
          matchDay.innerHTML = formattedDay;
        }
      } else {
        match.style.display = 'none';
      }
      index++;
    });

    if (!hasMatch) {
      curDay.setDate(curDay.getDate() + day); //day++
      index = 0;
    }
    if (count > 15) {
      if (!hasMatch) {
        getNextMonth();
      }
      break;
    }
    count++;
  }
}

function addDay(day) {
  let month = curDay.getMonth();
  curDay.setDate(curDay.getDate() + day);

  getMatch(day);
}

function getNextMonth() {
  console.log(12345);
  var form = document.changeMonth;
  var formDate = form.date;
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  formDate.value = curDay.toString();
  form.submit();
}
