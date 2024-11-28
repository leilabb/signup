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
const path = require("path");

const PORT = process.env.PORT || 3000;

const connectToDb = require("./db");

console.log("__dirname:", __dirname);

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

// Check if the app is running in production or development
const viewsPath = path.join(__dirname, "views"); // Use the 'views' path in development

console.log("VIEWSPATH", viewsPath);

//app.set("views", path.join(__dirname, "views"));
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
        console.log("User ID found:", matchingUser.id);
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
  res.render("home.ejs", { username: req.user.username });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("signup.ejs");
});

app.get("/signup", checkNotAuthenticated, (req, res) => {
  res.render("signup.ejs");
});

app.get("/list-views", (req, res) => {
  const fs = require("fs");
  fs.readdir(viewsPath, (err, files) => {
    if (err) res.status(500).send("Error reading views: " + err.message);
    else res.send("Files in views: " + files.join(", "));
  });
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
