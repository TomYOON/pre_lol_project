module.exports = {
  formatDate: function (date) {
    return date.toISOString().substring(0, 10);
  },
  mapTeamCode: function (teamName) {
    const team_map = {
      DRX: 'drx',
      KT: 'kt',
      T1: 't1',
      농심: 'nongsim',
      '담원 기아': 'dk',
      '리브 샌박': 'liv',
      아프리카: 'afreeca',
      젠지: 'geng',
      프레딧: 'predit',
      한화생명: 'hanwha',
    };
    return team_map[teamName];
  },
};
