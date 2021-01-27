const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: Date.now,
  },
  point: {
    type: Number,
    required: true,
  },
  subscribe: {
    type: [String],
    required: false,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
