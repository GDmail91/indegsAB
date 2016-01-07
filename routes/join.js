/******
 * JOIN PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET join listing. */
router.get('/', function(req, res, next) {
  res.render('auth/join', { title: 'Join Page' });
});

/* POST join listing. */
router.post('/', function(req, res, next) {
  var User = require('../models/user.js');
  // TODO form validation (email, pw, pw_confirm, gender, age)

  User.findOne({'email':req.body.email},function(err,res){
    if(err){
      console.err(err);
      throw err;
    }

    if(res) {
      // TODO 해당 이메일이 이미 있습니다.
      // backward process
      console.log('해당 이메일이 이미 있습니다.');
    } else {
      // user join process
      new User({
        email: req.body.email,
        pw: req.body.pw,
        gender: req.body.gender,
        age: req.body.age
      }).save();
    }
  });

  res.send('JOIN PAGE');
});

module.exports = router;
