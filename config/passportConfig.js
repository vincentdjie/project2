var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('../models');
//Same as passport website; authenticate user
/*
 * Passport "serializes" objects to make them easy to store, converting the
 * user to an identifier (id)
 */
passport.serializeUser(function(user, cb) { //take existing record in db and reduce it into an ID / to be sent easily over the internet(wire)
  cb(null, user.id);
});

/*
 * Passport "deserializes" objects by taking the user's serialization (id)
 * and looking it up in the database
 */
passport.deserializeUser(function(id, cb) { //take that id and look up user again
  db.user.findByPk(id).then(function(user) {
    cb(null, user);
  }).catch(cb);
});

/*
 * This is Passport's strategy to provide local authentication. We provide the
 * following information to the LocalStrategy:
 *
 * Configuration: An object of data to identify our authentication fields, the
 * username and password
 *
 * Callback function: A function that's called to log the user in. We can pass
 * the email and password to a database query, and return the appropriate
 * information in the callback. Think of "cb" as a function that'll later look
 * like this:
 *
 * login(error, user) {
 *   // do stuff
 * }
 *
 * We need to provide the error as the first argument, and the user as the
 * second argument. We can provide "null" if there's no error, or "false" if
 * there's no user.
 */
passport.use(new LocalStrategy({ //AUTHENTICATION
  usernameField: 'email', 
  passwordField: 'password'
}, function(email, password, cb) {
  db.user.findOne({
    where: { email: email } //find this email;  if none, db return u zero records/null
  }).then(function(user) { //checks email as a false if none or yes if its in db
    if (!user || !user.validPassword(password)) { //either didnt find user OR validPassword funct returns false; short circuit logical evaluation
      cb(null, false); //no user
    } else {
      cb(null, user); // evrything works
    }
  }).catch(cb); //catch will kill it and cb; swallow errors
}));

// export the Passport configuration from this module
module.exports = passport;