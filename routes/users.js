const express = require('express');
const router = express.Router();
const bcrpyt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');
const Vote = require('../models/Vote');
const Match = require('../models/Match');

// Login Page
router.get('/login', (req, res) => res.render('users/login'));

// Register Page
router.get('/register', (req, res) => res.render('users/register'));

// @desc user vote randing page
// @route GET /users/vote/:userId
router.get('/vote/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const votes = await Vote.find({ user: userId })
      .populate('match')
      .sort({ match: -1 });
    // console.log(`user.js: vote: ${votes}`);

    res.render('user-votes', { votes });
  } catch (err) {
    console.log(err);
  }
});
// Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  const point = 1000;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check pass elngth
  if (password.length < 6) {
    errors.push({ msg: 'password should be at least 6 chracters' });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: 'Email is already registered' });
        res.render('users/register', {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          point,
        });

        // Hash Password
        bcrpyt.genSalt(10, (
          err,
          salt //자릿수, 콜백
        ) =>
          bcrpyt.hash(newUser.password, salt, (err, hash) => {
            //password, salt, callback
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash; //콜백된 해쉬를 패스워드에 넣음
            // Save user
            newUser
              .save() //몽고DB에 save promise 반환
              .then((user) => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  try {
    req.logout(); //passport middleware에 있는 함수
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  } catch (error) {
    next();
  }
});
module.exports = router;
