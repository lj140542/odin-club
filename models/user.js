const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: { type: String, required: true, maxLength: 50 },
  lastname: { type: String, required: true, maxLength: 50 },
  username: { type: String, required: true, maxLength: 50 },
  password: { type: String, required: true, maxLength: 100 },
  club_member: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);