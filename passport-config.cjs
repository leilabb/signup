const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByUsername, getUserById) {
  const authenticateUser = async (username, password, done) => {
    //the parameters are form inputs
    const user = getUserByUsername(username);
    if (user === null) {
      return done(null, false, { message: "No user found with that name" });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log("Logged in user:", user);
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password." });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticateUser)
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = getUserById(id); // Adjust this function to fetch the user by ID
    return done(null, user.id);
  });
}

module.exports = initialize; // Export the function
