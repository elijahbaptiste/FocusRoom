const express = require("express");
const app = express();
//import Webcam from "webcam-easy";

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("Welcome");
});

app.listen(process.env.PORT || 5000);
