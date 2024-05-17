const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const createError = require("http-errors");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
require("dotenv").config();
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const app = express();

// Enable CORS with specific options
app.use(
  cors({
    origin: "https://blogggg-frontend.vercel.app",
    methods: "GET,POST,PATCH,DELETE", // Allow all HTTP methods
    allowedHeaders: "Content-Type,Authorization,Cookie", // Allow only specified headers
    credentials: true, // Allow sending cookies with cross-origin requests
  })
);

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
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      client: mongoose.connection,
      stringify: false,
      autoRemove: "interval",
      autoRemoveInterval: 30,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      secure: process.env.NODE_ENV === "production", // Force the cookie to only be sent over HTTPS
      httpOnly: true, // Prevent client-side scripts from accessing the cookie
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Prevents CSRF
    },
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
