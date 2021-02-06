const express = require('express');
const router = express.Router();

const Match = require('../models/Match');
const Vote = require('../models/Vote');
const helper = require('../helper/helper');
const { ensureAuthenticated } = require('../config/auth');

// @desc root/Landing page
// @route GET /
router.get('/', async (req, res) => {
  const today = new Date();
  const matchOfWeekCount = 10;

  try {
    const dateObj = helper.getThisWeek(today);
    const startDate = helper.formatDate(dateObj.startDate); //그 주의 월요일
    const endDate = helper.formatDate(dateObj.endDate); //일요일
    // console.log(startDate, endDate);
    let matches = await Match.find({
      gameStartDate: { $gte: startDate },
    })
      .limit(matchOfWeekCount)
      .sort({ _id: 1 });

    if (matches.length == 0) {
      res.send(matches);
      return;
    }

    if (req.isAuthenticated()) {
      const userVotes = await Vote.find({
        userId: req.user.id,
        matchId: { $gte: matches[0]._id },
      }).sort({ matchId: 1 });
      matches = helper.mapMatchVote(matches, userVotes);
    } else {
      matches = helper.mapMatchVote(matches, ['0']);
    }
    let isEmpty = false;

    if (matches.length == 0) {
      isEmpty = true;
    }

    res.render('main', {
      matches,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

// @desc get match data of week
// @route GET /match
router.get('/match', async (req, res) => {
  const reqDate = new Date(req.query.date);
  const matchOfWeekCount = 10;

  try {
    const dateObj = helper.getThisWeek(reqDate);
    const startDate = helper.formatDate(dateObj.startDate);
    const endDate = helper.formatDate(dateObj.endDate);
    const firstMatch = '2021-01-13'; //경기의 시작일, 나중에 디비에서 받아오는 식으로 바꿔야함

    if (endDate < firstMatch) {
      //경기가 첫경기보다 이전 주를 요청했을 경우
      res.send([]);
      return;
    }
    // console.log(startDate, endDate);
    let matches = await Match.find({
      gameStartDate: { $gte: startDate, $lte: endDate },
    })
      .limit(matchOfWeekCount)
      .sort({ _id: 1 });

    if (matches.length == 0) {
      matches = await Match.find({
        gameStartDate: { $gte: startDate },
      })
        .limit(matchOfWeekCount)
        .sort({ _id: 1 });
      if (matches.length == 0) {
        res.send(matches);
        return;
      }
    }
    console.log(matches);

    if (req.isAuthenticated()) {
      //로그인 되어있으면 투표한 데이터를 넘겨줌
      const userVotes = await Vote.find({
        userId: req.user.id,
        matchId: { $gte: matches[0]._id },
      })
        .limit(matchOfWeekCount)
        .sort({ matchId: 1 });
      matches = helper.mapMatchVote(matches, userVotes);
    } else {
      matches = helper.mapMatchVote(matches, ['0']);
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

// @desc vote to selected team
// @route POST /vote
router.post('/vote', async (req, res) => {
  console.log(req);
  if (!req.isAuthenticated()) {
    res.send({ status: 'login' });
    return;
  }
  try {
    /** TODO: 투표와 경기의 투표수 업데이트를 트랜잭션으로 바꿔야함. */
    const body = req.body;
    const matchIds = Object.keys(body);
    const userId = req.user.id;
    let votedArr = [];
    console.log(matchIds);
    if (matchIds.length == 0) {
      try {
        res.redirect('/');
      } catch (err) {
        console.log(err);
        res.render('error/500');
      }
      return;
    }
    for (const id of matchIds) {
      const votedTeam = body[id];
      const voteTo = `${votedTeam}TeamVotes`;
      const query = {};
      query[voteTo] = 1; //쿼리를 이런식으로 작성해야됨 바로 오브젝트{}에서 작성 불가
      const vote = await Vote.findOne({
        userId: userId,
        matchId: id,
      });

      if (vote) {
        // 이미 유저가 그 매치에 대해 투표했을 경우
        console.log('vote exist');
        continue;
      } else {
        console.log('voted');
        Vote.create({
          userId: userId,
          matchId: id,
          voteTo: votedTeam,
          processed: false,
        });
      }

      const match = await Match.findByIdAndUpdate(id, {
        $inc: query, //$inc 값++
      })
        .exec()
        .then((match, err) => {
          if (err) {
            req.render('error/500');
            return;
          }
          votedArr.push(id);
        });
    }
    if (votedArr.length > 0) {
      console.log(votedArr);
      const resObj = {};
      resObj['status'] = 'OK';
      resObj['voted'] = votedArr;
      res.send(JSON.stringify(resObj));
    } else {
      res.send({ status: 'reject' });
    }
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

module.exports = router;
