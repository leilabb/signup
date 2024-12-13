require("dotenv").config();

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passport-config.cjs");
const path = require("path");
const layoutExpress = require("express-ejs-layouts");

const PORT = process.env.PORT || 3000;

const connectToDb = require("./db");

app.use(layoutExpress);

app.use(express.static("public")); // Serves files from the public directory

app.use(express.urlencoded({ extended: true }));

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

const viewsPath = path.join(__dirname, "views");

app.set("views", viewsPath);
app.set("view engine", "ejs");

async function initializeApp() {
  const db = await connectToDb();

  //one call to the initialize function
  initializePassport(
    passport,
    async (username) => {
      try {
        const matchingUser = await db
          .collection("users")
          .findOne({ username: username });
        console.log("User found:", matchingUser);
        return matchingUser ? matchingUser : null;
      } catch (error) {
        console.log("Couldn't find user.");
        throw error;
      }
    },
    async (id) => {
      try {
        const matchingUser = await db.collection("users").findOne({ id: id });
        return matchingUser ? matchingUser : null;
      } catch (error) {
        console.log("Couldn't find user by id.");
        throw error;
      }
    }
  );
}

initializeApp();

//ROUTES
app.get("/", checkAuthenticated, (req, res) => {
  res.render("Home.ejs", { username: req.user.username });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("Login.ejs");
});

app.get("/signup", checkNotAuthenticated, (req, res) => {
  res.render("Signup.ejs");
});

app.get("/DeleteSuccess", checkNotAuthenticated, (req, res) => {
  res.render("DeleteSuccess.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/signup", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const db = await connectToDb();

    db.collection("users").insertOne({
      id: Date.now().toString(),
      username: req.body.username,
      password: hashedPassword,
    });

    console.log("user ", req.body.username, "inserted");

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
});

app.post("/deleteuser", checkAuthenticated, async (req, res) => {
  try {
    const db = await connectToDb();
    await db.collection("users").deleteOne({ id: req.user.id });
    res.render("DeleteSuccess.ejs");
  } catch (error) {
    console.log("Couldn't delete user");
    res.redirect("/login");
    throw error;
  }
});

app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return next();
}

app.listen(PORT, () => {
  console.log(`Server started successfully on http://localhost:${PORT}`);
});
