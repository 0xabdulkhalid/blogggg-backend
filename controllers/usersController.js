const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

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

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
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
        user.password = "";
        return res.status(200).json(user);
      });
    }
  }),
];

exports.login_user = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(406).json({
        message: info.message,
      });
    }

    req.login(user, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      user.password = "";
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
