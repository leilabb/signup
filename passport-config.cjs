const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserbyUsername) {
  const authenticateUser = async (username, password, done) => {
    const user = getUserbyUsername(username);
    if (user === null) {
      return done(null, false, { message: "No user found" });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticateUser)
  );

  passport.serializeUser((user, done) => {
    // Logic for serializing user
    done(null, user.id); // Assuming the user object has an 'id' property
  });

  passport.deserializeUser((id, done) => {
    // Logic for deserializing user
    const user = getUserById(id); // Adjust this function to fetch the user by ID
    done(null, user);
  });
}

module.exports = initialize; // Export the function
