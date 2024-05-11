const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
require("dotenv").config();

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
  body("password", "Password should be at least 8 characters.")
    .trim()
    .isLength({ min: 8 }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    if (!errors.isEmpty()) {
      const errorMessages = {};
      const err = errors.mapped();
      Object.keys(err).forEach((key) => {
        errorMessages[key] = err[key].msg;
      });

      res.status(406).json({ errors: errorMessages });
    } else {
      const result = await user.save();

      user.password = "";
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }

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

    user.password = "";
    req.login(user, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.status(200).json(user);
    });
  })(req, res, next);
};

exports.logout_user = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    // Delete the session document
    const sessionId = req.session.id;
    if (sessionId) {
      mongoose.connection.db
        .collection("sessions")
        .findOneAndDelete({ _id: sessionId })
        .then(() => {
          // Clear the cookie
          res.clearCookie("connect.sid");
          return res.status(200).send("success");
        })
        .catch((err) => {
          console.error(`Error removing session ${sessionId}: ${err}`);
          return res.status(500).send(`Error removing session: ${err}`);
        });
    } else {
      return res.status(200).send("success");
    }
  });
};

exports.authenticate_user = (req, res, next) => {
  if (req.isAuthenticated()) return res.json(req.user);

  return res.status(401).send("401 Unauthorized");
};
