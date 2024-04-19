const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  postId: { type: String, required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);
