const express = require('express');
const router = express.Router();

// @desc Login/Landing page
// @route GET /
router.get('/', (req, res) => {
  res.render('main.html');
});

module.exports = router;
