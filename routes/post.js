const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const commentsController = require("../controllers/commentsController");

router.post("/create-post", postController.create_post);

router.post("/create-comment/:postId", commentsController.create_comment);

router.get("/list-posts", postController.list_posts);

router.get("/view-post/:id", postController.view_post);

router.get("/:postId/comments", commentsController.get_comments);

router.delete("/delete-comment/:commentId", commentsController.delete_comment);

module.exports = router;
