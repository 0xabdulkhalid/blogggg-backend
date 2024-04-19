const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/sign-up", usersController.create_user);

router.post("/login", usersController.login_user);

router.get("/logout", usersController.logout_user);

module.exports = router;
