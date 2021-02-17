const express = require('express');
const router = express.Router();

// User model
const User = require('../models/User');
const pagePerUsers = 20;

router.get('/', async (req, res) => {
  const userObj = { userCount: 0 };
  try {
    const userCount = await User.countDocuments({}, (err, count) => count);
    const users = await User.find().sort({ point: -1 }).limit(pagePerUsers);

    userObj['userCount'] = userCount;
    userObj['page'] = 1;
    userObj['userData'] = users;
    userObj['pagePerUsers'] = pagePerUsers;
    res.render('rank', { userObj });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:page', async (req, res) => {
  const userObj = { userCount: 0 };
  const page = parseInt(req.params.page);
  try {
    const userCount = await User.countDocuments({}, (err, count) => count);
    const users = await User.find()
      .sort({ point: -1 })
      .skip((page - 1) * pagePerUsers)
      .limit(page * pagePerUsers);

    userObj['userCount'] = userCount;
    userObj['page'] = page;
    userObj['userData'] = users;
    userObj['pagePerUsers'] = pagePerUsers;
    res.render('rank', { userObj });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
