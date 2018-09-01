const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
  userId: String,
  teamId: String,
  token: String,
  emoji: [String],
  emojiPicks: [Number],
  responseIntervals: [Number],
  containWords: [String],
});

module.exports = mongoose.model('User', userSchema);
