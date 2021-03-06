const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const app = express();

// Passprot config
require('./config/passport')(passport);

// Express Session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Load config
dotenv.config({ path: './config/.env' });

// view 경로 설정
app.set('views', __dirname + '/views');

//set static path
app.use(express.static(__dirname + '/public'));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//connect db
connectDB();

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');

  if (req.isAuthenticated()) {
    res.locals.userName = req.user.name;
    res.locals.userPoint = req.user.point;
    res.locals.user = req.user._id;
  }
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/rank', require('./routes/ranking'));
app.use('/posts', require('./routes/posts'));

const PORT = process.env.PORT || 5000; //앞에 포트가 안될 경우 5000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
