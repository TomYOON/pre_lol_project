//Selectors
const matchDate = document.querySelector('match__date');

document.addEventListener('DOMContentLoaded', getTodayMatch);

function getTodayMatch() {
  const today = new Date().toISOString().substring(0, 10);
  const matchList = document.querySelectorAll('.match__list');
  console.log(matchList);
  console.log('sdf');
  matchList.forEach((match) => {
    if (match.childNodes[1].textContent === today) {
      match.style.display = 'flex';
    } else {
      match.style.display = 'none';
    }
  });
  console.log(matchList[0].childNodes[1].textContent === today);
}
