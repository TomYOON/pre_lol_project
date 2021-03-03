const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('posts/board'));

router.get('/new', (req, res) => res.render('posts/new'));

router.get('/test', (req, res) => res.render('posts/title'));
module.exports = router;
