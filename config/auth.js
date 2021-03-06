const Post = require('../models/Post');

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/users/login');
  },
  checkDeletePermission: function (req, res, next) {
    //삭제하는 게시글의 author와 요청자가 같은지 확인
    try {
      Post.findOne({ _id: req.params.postId }, function (err, post) {
        if (err) return res.json(err);
        if (post.author != req.user.id) return res.render('err/500');
        next();
      });
    } catch (err) {
      console.log(err);
      res.render('err/500');
    }
  },
};
