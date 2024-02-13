const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');

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

  if (!isValidObjectId(req.params.id)) {
    err = new Error('Bad parameter: id is not an actual DB ID');
    err.status = 400;
    return next(err);
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

// GET delete => verification before deletion
router.get('/delete/:id', async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    res.redirect('/');
    return;
  }

  if (!isValidObjectId(req.params.id)) {
    err = new Error('Bad parameter: id is not an actual DB ID');
    err.status = 400;
    return next(err);
  }

  const post = await Post.findById(req.params.id).exec();

  if (null === post) {
    let error = new Error('post not found');
    error.status = 404;
    next(error);
  }

  res.render('post-delete', {
    header: true,
    post: post,
  });
});

// POST delete => handle the post deletion 
router.post('/delete/:id', async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    res.redirect('/');
    return;
  }

  if (!isValidObjectId(req.params.id)) {
    err = new Error('Bad parameter: id is not an actual DB ID');
    err.status = 400;
    return next(err);
  }

  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;
