const express = require('express');
const router = express.Router();

const Match = require('../models/Match');
const helper = require('../helper/helper');

// @desc Login/Landing page
// @route GET /
router.get('/', async (req, res) => {
  try {
    const today = helper.formatDate(new Date('2021-01-21'));
    // const today = formatDate(new Date());
    const matches = await Match.find({ gameStartDate: today });
    let isEmpty = false;
    console.log(matches[0].awayTeamName);
    if (matches.length == 0) {
      isEmpty = true;
    }

    res.render('main', {
      matches,
      isEmpty,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

module.exports = router;
