if (process.env.NODE_ENV !== "production") {
  require("dotenv").config;
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("passport-config");

initializePassport(passport, (username) => {
  return users.find((user) => user.username === username);
});

const users = [];
app.use(flash);
app.use(session, {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});

app.use(passport.initialize());
app.use(passport.session());

app.set("view-engine", "ejs");

app.post("/login", passport.authenticate("local"), {
  successRedirect: "/",
  failureRedirect,
});

app.get("/", (req, res) => {
  res.render("index.ejs", { name: "Kyle" });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.listen(3000);
