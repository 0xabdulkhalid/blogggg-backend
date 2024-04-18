const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, require: true, maxLength: 20 },
  password: { type: String, require: true, maxLength: 20 },
});

module.exports = mongoose.model("User", UserSchema);
