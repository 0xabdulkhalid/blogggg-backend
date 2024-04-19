const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
require("dotenv").config;

exports.create_user = [
  body("username", "User Name is required.")
    .trim()
    .isLength({ min: 1 })
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error("Username is already in use.");
      }
    }),
  body("password", "Password should be at least 3 characters.")
    .trim()
    .isLength({ min: 3 }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      user.password = req.body.password;
      res.status(406).json({ errors: errors.mapped() });
    } else {
      const result = await user.save();

      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        delete user.password;
        return res.status(200).json(user);
      });
    }
  }),
];

exports.login_user = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(406).json({
        errors: info.message,
        username: req.body.username,
        password: req.body.password,
      });
    }

    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      delete user.password;
      return res.status(200).json(user);
    });
  })(req, res, next);
};

exports.logout_user = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send("success");
  });
};
