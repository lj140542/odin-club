const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, required: true },
  title: { type: String, required: true, maxLength: 50 },
  text: { type: String, required: true, maxLength: 500 },
});

// Virtuals 
PostSchema.virtual('formatted_timestamp').get(function () {
  return DateTime.fromJSDate(this.timestamp).toISODate();
});

module.exports = mongoose.model('Post', PostSchema);