const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Vote = require('../models/Vote');
const helper = require('../helper/helper');
const { ensureAuthenticated } = require('../config/auth');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

router.get('/', async (req, res) => {
  res.render('rank');
});

function mapMatchVote(matches, votes) {
  // if (matches.length == 0) {
  //   return matches;
  // }
  let voteIdx = 0;
  let matchIdx = 0;
  let mapedArr = [];
  while (matchIdx < matches.length) {
    const obj = matches[matchIdx].toObject();
    if (voteIdx < votes.length && obj._id == votes[voteIdx].matchId) {
      obj['userVote'] = votes[voteIdx].voteTo;
      voteIdx++;
    } else {
      obj['userVote'] = '';
    }
    mapedArr.push(obj);
    matchIdx++;
  }
  // console.log(`length: ${voteIdx}, ${votes.length}`);
  return mapedArr;
}

// @desc root/Landing page
// @route GET /
router.get('/test2', async (req, res) => {
  console.log(req.isAuthenticated());
  // console.log(req.query, '123');
  const reqDate = new Date(req.query.date);
  // console.log(moment().endOf('week').toDate());
  try {
    const dateObj = helper.getThisWeek(reqDate);
    const startDate = helper.formatDate(dateObj.startDate);
    const endDate = helper.formatDate(dateObj.endDate);
    // console.log(startDate, endDate);
    let matches = await Match.find({
      gameStartDate: { $gte: startDate, $lte: endDate },
    }).sort({ _id: 1 });

    if (req.isAuthenticated()) {
      const userVotes = await Vote.find({
        userId: req.user.id,
      }).sort({ matchId: 1 });
      matches = mapMatchVote(matches, userVotes);
    } else {
      matches = mapMatchVote(matches, ['0']);
    }
    let isEmpty = false;

    if (matches.length == 0) {
      isEmpty = true;
    }

    res.send(matches);
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

module.exports = router;
