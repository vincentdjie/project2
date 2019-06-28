const express = require('express');
const db = require('../models');
const passport = require('../config/passportConfig');
const router = express.Router();

// GET /auth/signup - sends signup form
router.get('/signup', function(req, res) { //route portion: router.get('/signup', rest is controller funct
  res.render('auth/signup');
});

// GET /auth/signup - receives data from form above;
router.post('/signup', function(req, res) {
  db.user.findOrCreate({
    where: {email: req.body.email}, 
    defaults: {
      name: req.body.name,
      password: req.body.password
    }//.then(function([user,created])) OR
  }).spread(function(user, created) { //return as an array; spread funct packs into arrays and into 2 separate var
    if (created) {
      console.log("user was created, not found");
      passport.authenticate('local', { //returns router funct to send res
        successRedirect: '/',
        successFlash: 'Account created and logged in'
      })(req, res); //immediately invoked function expression (iffy); password session is attached to reqr
    } else { //else if found, hence not created...
      console.log("email already exists");
      req.flash('error', 'Email already exists!');
      res.redirect('/auth/signup');
    }
  }).catch(function(error) {
    console.log('Error:', error.message);
    req.flash('error', error.message); //prob gon be msg from sequel validation in db
    res.redirect('/auth/signup');
  });
});

//GET /auth/login - sends the login form
router.get('/login', function(req, res) {
  res.render('auth/login');
});

//POST /auth/login - does the authentication 
router.post('/login', passport.authenticate('local', {
  successRedirect: '/', 
  failureRedirect: '/auth/login', 
  successFlash: 'You have logged in!',
  failureFlash: 'Invalid username and/or password!'
}));

// GET /auth/logout - deletes the session
router.get('/logout', function(req, res) {
  req.logout(); //deletes session from memory
  console.log('logged out');
  req.flash('success', 'You have logged out!');
  res.redirect('/');
});

module.exports = router;
