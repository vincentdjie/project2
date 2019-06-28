require('dotenv').config();
const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
// Module allows use of sessions
const session = require('express-session');
// imports passport local strategy
const passport = require('./config/passportConfig');
//module for flash messages
const flash = require('connect-flash');
const isLoggedIn = require('./middleware/isLoggedIn'); // ./ current dir 
const helmet = require('helmet');

// This is only used by the session store
const db = require('./models');

const app = express();

//This line makes the session use sequelize to write session data to a postgres table
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sessionStore = new SequelizeStore({ //constructor funct that takes option obj
  db: db.sequelize,
  expiration: 1000 * 60 * 30 //1000ms * 60 (1min) * 30(half min)
});

//every single middleware has a .next internally to go to next one when done
app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false })); //bodyparser to create req.body
app.use(express.static(__dirname + "/public")); //static dir locator
app.use(ejsLayouts); //not built in express
app.use(helmet()); // protects our headers

// Configures express-session middleware
app.use(session({ //still logged in when ppl refresh page 
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

//Use this line once to set up the store table
sessionStore.sync();

//Starts the flash middleware
app.use(flash()); //flash messages

// Link passport to the express session
// MUST BE BELOW SESSION
app.use(passport.initialize());
app.use(passport.session()); //create new session

app.use(function(req, res, next) { //writing funct w/in functs
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
})

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile');
});

//app.get('/*'); a wild card , good to test every route it will not fail

app.use('/auth', require('./controllers/auth')); //no match -> error 404 cant post blog
//counterproductive; do u wanna sign up? well u need to be a member before u can sign up..
// app.use('/auth', require('./controllers/auth'));

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
