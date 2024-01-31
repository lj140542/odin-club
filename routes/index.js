const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.user) {
    res.render('dashboard', { header: true, title: 'Odin Club' });
    return;
  }
  res.render('index', { title: 'Odin Club' });
});

// JOIN ROUTES
router.get('/join', (req, res, next) => {
  try {
    if (!req.user || req.user.club_member == 'true') {
      res.redirect('/');
      return;
    }

    res.render('join', { header: true, title: 'Odin Club' });
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
    res.render('join', { header: true, title: 'Odin Club', wrong_passcode: true })
  }
});


module.exports = router;
