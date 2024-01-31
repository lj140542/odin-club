const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require("passport-local").Strategy;
const { body, validationResult } = require("express-validator");

// PASSPORT SETTINGS
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) return done(null, false, { message: "Incorrect username" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
passport.serializeUser((user, done) => { done(null, user.id); });
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
})

// SIGN UP
// get request to signup => display signup form
router.get('/signup', (req, res) => {
  if (req.user) {
    res.redirect('/');
    return;
  }
  res.render('signup', { title: 'Odin Club' })
});
// post request to signup => handle the signup
router.post('/signup', [
  body('firstname')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage('First name must be specified (max 50 characters).'),
  body('lastname')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified.')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters.'),
  body('username')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage('Username must be specified (max 50 characters).'),
  body('password')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Password must be specified (max 100 characters).'),
  body('confirm_password')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .withMessage('Password confirmation must be specified (max 100 characters).')
    .custom((confirm_password, { req }) => {
      if (confirm_password !== req.body.password) {
        throw new Error('The passwords do not match');
      }
      return true;
    }),

  async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: '',
      club_member: false,
    });

    if (!errors.isEmpty()) {
      res.render('signup', {
        title: 'Odin Club',
        user: user,
        errors: errors.array()
      });
      return;
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    await user.save();
    res.redirect('/');
  },
]);

// LOGIN
// get request to login => display login form
router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/');
    return;
  }
  res.render('login', { title: 'Odin Club' })
});
// post request to login => handle the login
router.post('/login', passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureMessage: true,
}));

// LOGOUT
// get request to logout => handle the logout
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;