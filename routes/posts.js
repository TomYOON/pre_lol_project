const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { ensureAuthenticated } = require('../config/auth');

const pagePerPost = 10;

router.get('/', async (req, res) => {
  const page =
    typeof req.query.page == 'undefined' ? 1 : parseInt(req.query.page);
  console.log(page);
  try {
    const postCount = await Post.countDocuments({}, (err, count) => count);
    const posts = await Post.find()
      .skip((page - 1) * pagePerPost)
      .limit(pagePerPost)
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    console.log(posts[0]);
    res.render('posts/board', {
      postCount,
      posts,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

router.get('/new', ensureAuthenticated, (req, res) => res.render('posts/new'));

router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).populate({
      path: 'author',
      select: 'name',
    });
    post.views++;
    post.save();

    res.render('posts/title', {
      post,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

router.post('/', ensureAuthenticated, (req, res) => {
  console.log(req.body);
  try {
    req.body['author'] = req.user.id;
    Post.create(req.body, function (err, post) {
      if (err) {
        return res.render('error/500');
      }
      const postId = post._id;
      return res.redirect(`/posts/${postId}`);
    });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
