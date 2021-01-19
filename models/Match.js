const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  homeTeamName: {
    type: String,
  },
  awayTeamName: {
    type: String,
  },
  homeTeamScore: {
    type: String,
  },
  awayTeamScore: {
    type: String,
  },
  homeTeamEmblem64URI: {
    type: String,
  },
  awayTeamEmblem64URI: {
    type: String,
  },
  gameStartDate: {
    type: String,
  },
  gameStartTime: {
    type: String,
  },
  state: {
    type: String,
  },
});

const MatchSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  scheduleList: {
    type: Array,
    required: true,
  },
  empty: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('Match', MatchSchema);
