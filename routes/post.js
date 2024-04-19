const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.post("/create-post", postController.create_post);

router.get("/list-posts", postController.list_posts);

router.get("/view-post/:id", postController.view_post);

module.exports = router;
