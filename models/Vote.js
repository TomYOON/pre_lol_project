const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  matchId: {
    type: String,
    require: true,
  },
  voteTo: {
    type: String,
    require: true,
  },
  processed: {
    type: Boolean,
    require: true,
  },
  createdAt: { type: Date, default: Date.now },
  point: {
    type: Number,
    required: false,
  },
});

const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;
