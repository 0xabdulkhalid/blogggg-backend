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

exports.get_comments = asyncHandler(async (req, res) => {
  const comments = !req.user
    ? await Comment.find({ postId: req.params.postId }, { postId: 0 }).lean()
    : await Comment.aggregate([
        {
          $match: { postId: req.params.postId }, // Filter comments by postId from route parameters
        },
        {
          $project: {
            author: 1,
            content: 1,
            createdAt: 1,
            postId: 0,
            isEditable: {
              $eq: ["$author", req.user.username], // Check if the author matches the current user
            },
          },
        },
      ]);

  res.status(200).json({ success: true, data: comments });
});
