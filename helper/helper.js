module.exports = {
  formatDate: function (date) {
    return date.toISOString().substring(0, 10);
  },
  formatDateToMonth: function (date) {
    return date.toISOString().substring(0, 7);
  },

  getThisWeek: function (curr = new Date()) {
    const today = (curr.getDay() + 6) % 7; //월요일부터 시작 월 = 0, 일 = 6
    let first = curr.getDate() - today; // First day is the day of the month - the day of the week
    // console.log(`first: ${first}`, curr.getDay());
    let firstday = new Date(curr.setDate(first));
    let lastday = new Date(curr.setDate(firstday.getDate() + 6));
    return { startDate: firstday, endDate: lastday };
  },

  mapMatchVote: function (matches, votes) {
    let voteIdx = 0;
    let matchIdx = 0;
    let mapedArr = [];
    while (matchIdx < matches.length) {
      const obj = matches[matchIdx].toObject();
      obj['userVote'] = '';
      if (!(voteIdx < votes.length)) {
        mapedArr.push(obj);
        matchIdx++;
        continue;
      }

      if (obj._id == votes[voteIdx].matchId) {
        obj['userVote'] = votes[voteIdx].voteTo;
        voteIdx++;
        matchIdx++;
      } else if (obj._id > votes[voteIdx].matchId) {
        voteIdx++;
      } else {
        matchIdx++;
      }
      mapedArr.push(obj);
    }
    console.log(`voteIdx: ${voteIdx},`, votes);
    return mapedArr;
  },
};
