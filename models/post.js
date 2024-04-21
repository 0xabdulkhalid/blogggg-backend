const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  cover: { type: String, require: true },
  createdAt: { type: Date, default: Date.now() },
  isPublished: { type: Boolean, require: true },
  tag: { type: String },
});

module.exports = mongoose.model("Post", PostSchema);
