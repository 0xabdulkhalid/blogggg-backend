const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment");
const Post = require("../models/post");

exports.create_comment = asyncHandler(async (req, res) => {
  // Check if the user is Logged in
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Unauthorized: Login to create comments" });

  const post = await Post.findById(req.params.postId);

  // Check if post really exists before proceeding.
  if (!post) {
    return res
      .status(404)
      .json({
        success: false,
        message: "Post not found, Comment can't be created",
      });
  }

  const comment = new Comment({
    author: req.user.username,
    content: req.body.content,
    postId: req.params.postId,
  });

  await comment.save();
  res
    .status(201)
    .json({ success: true, message: "Comment created successfully" });
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
            isEditable: {
              $eq: ["$author", req.user.username], // Check if the author matches the current user
            },
          },
        },
      ]);

  res.status(200).json({ success: true, data: comments });
});

exports.modify_comment = asyncHandler(async (req, res) => {
  const toDeleteComment = req.query.delete === "true";

  const comment = await Comment.findById(req.params.commentId);

  // Check if comment really exists before proceeding.
  if (!comment) {
    return res
      .status(404)
      .json({ success: false, message: "Comment not found" });
  }

  // Check if the current user is authorized to modify the comment
  if (comment.author !== req.user.username) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to modify this comment",
    });
  }

  // Delete the comment, Otherwise update the comment
  if (toDeleteComment) {
    await Comment.findByIdAndDelete(req.params.commentId);
  } else {
    comment.content = req.body.content;
    await comment.save();
  }

  res.status(200).json({
    success: true,
    message: `Comment ${toDeleteComment ? "deleted" : "edited"} successfully`,
  });
});

exports.delete_comments_for_post = async (postId) => {
  await Comment.deleteMany({ postId: postId });
};
