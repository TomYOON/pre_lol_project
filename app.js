const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');

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

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000; //앞에 포트가 안될 경우 5000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
