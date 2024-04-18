const express = require("express");

const app = express();

app.get("/", (req, res, next) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is listening on Port 3000");
});
