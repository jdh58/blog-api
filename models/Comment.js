const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, required: true },
  user: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model('Comment', CommentSchema);
