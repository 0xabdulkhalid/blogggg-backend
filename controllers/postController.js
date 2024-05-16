const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const commentsController = require("./commentsController");

exports.create_post = asyncHandler(async (req, res, next) => {
  // Check if the user is an admin
  if (!req.user || (!req.user && !req.user.isAdmin)) {
    return res
      .status(403)
      .json({ message: "Unauthorized: Only admins can create posts" });
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    cover: req.body.cover,
    description: req.body.description,
    isPublished: req.body.isPublished,
    tag: req.body.tag,
  });

  const result = await post.save();
  return res.status(200).send("success");
});

exports.list_posts = asyncHandler(async (req, res, next) => {
  const tag = req.query.tag || "All";
  const limit = parseInt(req.query.limit) || 6; // Default limit is 6
  const offset = parseInt(req.query.offset) || 0; // Default offset is 0

  const query =
    tag === "All" ? { isPublished: true } : { isPublished: true, tag: tag };

  // Admin can only view both Published and Un-published Posts
  if (!(!req.user || (!req.user && !req.user.isAdmin))) {
    query.isPublished = req.query.isNotPublished ? false : true;
  }

  const totalCount = await Post.countDocuments(query);

  const posts = await Post.find(query, { content: 0 })
    .select("title cover createdAt description")
    .skip(offset)
    .limit(limit)
    .exec();

  return res.status(200).json({
    posts,
    totalCount,
    limit,
    offset,
  });
});

exports.view_post = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  // Check if post really exists before proceeding.
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  return res.status(200).json(post);
});

exports.modify_post = asyncHandler(async (req, res) => {
  // Check if the user is an admin
  if (!req.user || (!req.user && !req.user.isAdmin)) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to modify this post",
    });
  }

  const post = await Post.findById(req.params.postId);

  // Check if post really exists before proceeding.
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const toDeletePost = req.query.delete === "true";

  // Delete the post, Otherwise update the post
  if (toDeletePost) {
    await commentsController.delete_comments_for_post(req.params.postId);
    await Post.findByIdAndDelete(req.params.postId);
  } else {
    post.title = req.body.title;
    post.content = req.body.content;
    post.cover = req.body.cover;
    post.description = req.body.description;
    post.tag = req.body.tag;
    await post.save();
  }

  res.status(200).json({
    success: true,
    message: `Post ${toDeletePost ? "deleted" : "edited"} successfully`,
  });
});
