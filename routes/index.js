const express = require('express');
const router = express.Router();

const Match = require('../models/Match');
const formatDate = require('../helper/helper').formatDate;

// @desc Login/Landing page
// @route GET /
router.get('/', async (req, res) => {
  try {
    const today = formatDate(new Date('2021-01-21'));
    const matches = await Match.findOne({ date: today });
    res.render('main', {
      matches,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

module.exports = router;
