var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: "Subanesh's World", content: "The world of Engineers" });
});

module.exports = router;
