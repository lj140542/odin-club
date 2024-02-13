const express = require('express');
const router = express.Router();
const Post = require('../models/post');

/* GET home page. */
router.get('/', async (req, res, next) => {
  if (req.user) {
    const posts = await Post.find({}).populate('author').exec();
    res.render('dashboard', { header: true, posts: posts });
    return;
  }
  res.render('index');
});

// JOIN ROUTES
router.get('/join', (req, res, next) => {
  try {
    if (!req.user || req.user.club_member) {
      res.redirect('/');
      return;
    }

    res.render('join', { header: true, back: true });
  } catch (error) {
    next(error);
  }
});

router.post('/join', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/');
    return;
  }

  if (req.body.passcode === process.env.PASSCODE) {
    const user = req.user;
    user.club_member = true;
    await user.save();
    res.redirect('/');
  } else {
    res.render('join', { header: true, back: true, wrong_passcode: true })
  }
});


module.exports = router;
