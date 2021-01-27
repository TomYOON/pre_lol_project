const express = require('express');
const router = express.Router();
const bcrpyt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');
const { route } = require('.');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

module.exports = router;
