const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const createError = require("http-errors");
const mongoose = require("mongoose");
require("dotenv").config();
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const app = express();

const mongoDB = process.env.MONGO_URI;
mongoose.set("strictQuery", false);
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/user", userRouter);
app.use("/blog", postRouter);

app.get("/test", (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(403).send("Unauthenticated");

  return res.status(200).send("You're Authenticated");
});

require("./passport-config");

// Error handlers
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

app.listen(3000, () => {
  console.log("Server is listening on Port 3000");
});
