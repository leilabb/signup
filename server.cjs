if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passport-config.cjs");
const PORT = process.env.PORT || 3000;

initializePassport(passport, (username) => {
  return users.find((user) => user.username === username);
});

app.use(express.static("public")); // Serves files from the public directory(styles)

app.use(express.urlencoded({ extended: true }));

const users = [];
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view-engine", "ejs");

//ROUTES

app.get("/", (req, res) => {
  res.render("login.ejs", { name: "Leila" });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/loggedIn", (req, res) => {
  res.render("loggedIn.ejs");
});

app.post("/login", (req, res) => {
  passport.authenticate("local"),
    {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true, //display error messages that we wrote
    };
});

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //check if the fields are not empty before doing this. Also before storing them, do some validation.
    // Ex: no 2 usernames should be the same
    users.push({
      id: Date().now.toString(),
      username: req.body.username,
      password: hashedPassword,
    });

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
  console.log(users);
});

app.listen(PORT, () => {
  console.log(`Server started successfully on http://localhost:${PORT}`);
});
