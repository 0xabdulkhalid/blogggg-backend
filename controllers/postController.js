const asyncHandler = require("express-async-handler");
const Post = require("../models/post");

exports.create_post = asyncHandler(async (req, res, next) => {
  // Check if the user is an admin
  if (!req.user && !req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Unauthorized: Only admins can create posts" });
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    isPublished: req.body.publish,
  });

  const result = await post.save();
  return res.status(200).send("success");
});

exports.list_posts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ isPublished: true }, { content: 0 })
    .select("title createdAt")
    .exec();
  return res.status(200).json(posts);
});

exports.view_post = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  return res.status(200).json(post);
});
