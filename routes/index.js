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

module.exports = router;
