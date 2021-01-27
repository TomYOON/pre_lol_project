const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const app = express();

// Load config
dotenv.config({ path: './config/.env' });

// view 경로 설정
app.set('views', __dirname + '/views');

//set static path
app.use(express.static(__dirname + '/public'));

// 화면 engine을 ejs로 설정
app.set('view engine', 'ejs');

//connect db
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 5000; //앞에 포트가 안될 경우 5000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
