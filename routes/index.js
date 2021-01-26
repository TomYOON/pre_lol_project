const express = require('express');
const router = express.Router();

const Match = require('../models/Match');
const helper = require('../helper/helper');

// @desc Login/Landing page
// @route GET /
router.get('/', async (req, res) => {
  try {
    // const today = helper.formatDate(new Date('2021-01-21'));
    const today = helper.formatDateToMonth(new Date());

    const matches = await Match.find({
      gameStartDate: { $regex: new RegExp(`^${today}`) },
    });
    let isEmpty = false;
    console.log(matches);
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

router.get('/change-month', async (req, res) => {
  console.log(req.query);
  try {
    // const today = helper.formatDate(new Date('2021-01-21'));
    const today = helper.formatDateToMonth(new Date(req.query.date));

    const matches = await Match.find({
      gameStartDate: { $regex: new RegExp(`^${today}`) },
    });
    let isEmpty = false;
    console.log(matches);
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
