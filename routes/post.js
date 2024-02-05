const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');

// GET new => new post form
router.get('/new', (req, res, next) => {
  if (req.user) {
    res.render('post-form', { header: true });
    return;
  }
  res.redirect('/');
});

// POST new => create the new post
router.post('/new', [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('The post must have a title.')
    .isLength({ max: 50 })
    .withMessage('The title must not exceed 50 characters.')
    .escape(),
  body('text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('The post must of a text.')
    .isLength({ max: 500 })
    .withMessage('The post text must not exceed 500 characters.')
    .escape(),

  async (req, res, next) => {
    if (!req.user) {
      redirect('/');
      return;
    }

    const errors = validationResult(req);

    const post = new Post({
      author: req.user.id,
      timestamp: new Date(),
      title: req.body.title,
      text: req.body.text,
    });

    if (!errors.isEmpty()) {
      res.render('post-form', {
        header: true,
        post: post,
        errors: errors.array()
      });
      return;
    }

    await post.save();
    res.redirect(post.url);
  },
]);

router.get('/:id', async (req, res, next) => {
  if (!req.user) {
    res.redirect('/');
    return;
  }

  const post = await Post.findById(req.params.id).populate('author').exec();

  if (null === post) {
    let error = new Error('post not found');
    error.status = 404;
    next(error);
  }

  res.render('post-detail', {
    header: true,
    post: post,
  });
});

module.exports = router;
