const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
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
