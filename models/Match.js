const mongoose = require('mongoose');

// [{'homeTeamName': '젠지',
// 'awayTeamName': 'KT',
// 'homeTeamScore': '2',
// 'awayTeamScore': '0',
// 'gameStartDate': '2021-01-13',
// 'gameStartTime': '17:00',
// 'gameStatus': 'RESULT',
// 'homeTeamCode': 'geng',
// 'awayTeamCode': 'kt',
// 'homeTeamVotes': 0,
// 'awayTeamVotes': 0},
const MatchSchema = new mongoose.Schema({
  homeTeamName: {
    type: String,
    required: true,
  },
  awayTeamName: {
    type: String,
    required: true,
  },
  homeTeamScore: {
    type: String,
    required: true,
  },
  awayTeamScore: {
    type: String,
    required: true,
  },
  gameStartDate: {
    type: String,
    required: true,
  },
  gameStartTime: {
    type: String,
    required: true,
  },
  gameStatus: {
    type: String,
    required: true,
  },
  homeTeamCode: {
    type: String,
    required: true,
  },
  awayTeamCode: {
    type: String,
    required: true,
  },
  homeTeamVotes: {
    type: Number,
    required: true,
  },
  awayTeamVotes: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Match', MatchSchema);
