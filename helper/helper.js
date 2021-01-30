module.exports = {
  formatDate: function (date) {
    return date.toISOString().substring(0, 10);
  },
  formatDateToMonth: function (date) {
    return date.toISOString().substring(0, 7);
  },

  getThisWeek: function (curr = new Date()) {
    // 수~일까지
    var first = curr.getDate() - curr.getDay() + 3; // First day is the day of the month - the day of the week
    // first.getDate()

    var firstday = new Date(curr.setDate(first));
    var lastday = new Date(curr.setDate(firstday.getDate() + 4));
    return { startDate: firstday, endDate: lastday };
  },
  // mapTeamCode: function (teamName) {
  //   const team_map = {
  //     DRX: 'drx',
  //     KT: 'kt',
  //     T1: 't1',
  //     농심: 'nongsim',
  //     '담원 기아': 'dk',
  //     '리브 샌박': 'liv',
  //     아프리카: 'afreeca',
  //     젠지: 'geng',
  //     프레딧: 'predit',
  //     한화생명: 'hanwha',
  //   };
  //   return team_map[teamName];
  // },
};
