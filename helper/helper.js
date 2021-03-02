module.exports = {
  formatDate: function (date) {
    return date.toISOString().substring(0, 10);
  },
  formatDateToMonth: function (date) {
    return date.toISOString().substring(0, 7);
  },

  getThisWeek: function (date = new Date()) {
    if (typeof date == typeof '') {
      // 스트링으로 들어올 경우 처리
      date = new Date(date);
    }
    const today = (date.getDay() + 6) % 7; //월요일부터 시작 월 = 0, 일 = 6
    let first = date.getDate() - today; // First day is the day of the month - the day of the week
    // console.log(`first: ${first}`, date.getDay());
    let firstday = new Date(date.setDate(first));
    let lastday = new Date(date.setDate(firstday.getDate() + 6));
    return { startDate: firstday, endDate: lastday };
  },

  getPrevWeek: function (date) {
    if (typeof date == typeof '') {
      // 스트링으로 들어올 경우 처리
      date = new Date(date);
    }
    date.setDate(date.getDate() - 7);
    return this.getThisWeek(date);
  },

  getNextWeek: function (date) {
    if (typeof date == typeof '') {
      // 스트링으로 들어올 경우 처리
      date = new Date(date);
    }
    date.setDate(date.getDate() + 7);
    return this.getThisWeek(date);
  },

  mapMatchVote: function (matches, votes) {
    let voteIdx = 0;
    let matchIdx = 0;
    let mapedArr = [];
    while (matchIdx < matches.length) {
      const obj = matches[matchIdx].toObject();
      obj['userVote'] = '';
      if (voteIdx >= votes.length) {
        mapedArr.push(obj);
        matchIdx++;
        continue;
      }

      if (obj._id == votes[voteIdx].match) {
        obj['userVote'] = votes[voteIdx].voteTo;
        voteIdx++;
        matchIdx++;
      } else if (obj._id > votes[voteIdx].match) {
        voteIdx++;
        continue;
      } else {
        matchIdx++;
      }
      mapedArr.push(obj);
    }
    return mapedArr;
  },
};
