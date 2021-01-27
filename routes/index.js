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
    const errorMsg = '';
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

router.post('/vote', async (req, res) => {
  console.log(Object.keys(req.body));
  const body = req.body;
  ids = Object.keys(body);
  if (ids.length == 0) {
    //서버 안거치고 js로 차단하고 싶은데 아직 방법을 못찾음
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
  ids.forEach(async (id) => {
    const voteTo = `${body[id]}TeamVotes`;
    const query = {};
    query[voteTo] = 1; //쿼리를 이런식으로 작성해야됨 바로 오브젝트{}에서 작성 불가
    console.log(query);
    const match = await Match.findByIdAndUpdate(id, {
      $inc: query, //$inc 증가시키는 것
    })
      .exec()
      .then((match, err) => {
        console.log(`match: ${match}`);
        if (err) {
          req.render('error/500');
          return;
        }
      });
  });
  res.send('/');
});

module.exports = router;
