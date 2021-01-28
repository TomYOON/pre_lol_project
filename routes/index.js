const express = require('express');
const router = express.Router();

const Match = require('../models/Match');
const Vote = require('../models/Vote');
const helper = require('../helper/helper');
const { ensureAuthenticated } = require('../config/auth');

function mapMatchVote(matches, votes) {
  if (matches.length == 0 || votes.length == 0) {
    return matches;
  }
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
router.get('/', async (req, res) => {
  console.log(req.isAuthenticated());
  try {
    const today = helper.formatDateToMonth(new Date());
    let matches = await Match.find({
      gameStartDate: { $regex: new RegExp(`^${today}`) },
    }).sort({ _id: 1 });

    if (req.isAuthenticated()) {
      const userVotes = await Vote.find({
        userId: req.user.id,
      }).sort({ matchId: 1 });
      matches = mapMatchVote(matches, userVotes);
    }
    let isEmpty = false;

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
    const errorMsg = '';
    const matches = await Match.find({
      gameStartDate: { $regex: new RegExp(`^${today}`) },
    });
    let isEmpty = false;
    if (matches.length == 0) {
      isEmpty = true;
    }

    res.render('main', {
      matches,
      isEmpty,
      errorMsg,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

// @desc vote to selected team
// @route POST /vote
router.post('/vote', ensureAuthenticated, async (req, res) => {
  try {
    console.log(Object.keys(req.body));
    const body = req.body;
    const matchIds = Object.keys(body);
    const userId = req.user.id;
    console.log(matchIds);
    if (matchIds.length == 0) {
      // res.redirect('/');
      // 서버 안거치고 js로 차단하고 싶은데 아직 방법을 못찾음
      try {
        const today = helper.formatDateToMonth(new Date());
        const errorMsg = '한 개 이상 선택해야 합니다.';
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
          errorMsg,
        });
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
        console.log(vote);
        continue;
      } else {
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
          console.log(`match: ${match}`);
          if (err) {
            req.render('error/500');
            return;
          }
        });
    }
    res.redirect(`/`);
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

module.exports = router;
