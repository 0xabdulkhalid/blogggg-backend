const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment");

exports.create_comment = asyncHandler(async (req, res) => {
  // Check if the user is Logged in
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Unauthorized: Login to create comments" });

  const comment = new Comment({
    author: req.user.username,
    content: req.body.content,
    postId: req.params.postId,
  });

  await comment.save();
  res.status(201).json({ success: true });
});
