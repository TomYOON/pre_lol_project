const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => res.render('posts/board'));

router.get('/new', (req, res) => res.render('posts/new'));

router.get('/test', (req, res) => res.render('posts/title'));

router.post('/', ensureAuthenticated, (req, res) => {
  console.log(req.body);
});
module.exports = router;
