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

  // validation check
  var Validator = require('validator');
  if(Validator.isEmail(req.body.email)  // email check
  && Validator.equals(req.body.pw, req.body.pw_confirm) // password confirm
  && Validator.isNumeric(req.body.age)  // number only
  && (Validator.equals(req.body.gender, 'male') || Validator.equals(req.body.gender, 'female'))) {
    User.findOne({'email':req.body.email},function(err,result){
      if(err){
        console.err(err);
        throw err;
      }

      if(result) {
        // TODO 해당 이메일이 이미 있습니다.
        // backward process
        console.log('해당 이메일이 이미 있습니다.');
        res.send('회원가입 실패<br>원인: 해당 이메일이 이미 있습니다.');
      } else {
        // user join process

        // password hashing
        var crypto = require('crypto');
        var salt = Math.round((new Date().valueOf() * Math.random())) + "";
        var hashpass = crypto.createHash("sha512").update(req.body.pw+salt).digest("hex");

        new User({
          email: req.body.email,
          pw: hashpass,
          salt: salt,
          gender: req.body.gender,
          age: req.body.age
        }).save();
        res.send('회원가입 성공.<br>가입 이메일: '+req.body.email);
      }
    });
  } else {
    // backward process
    console.log('유효성 검사 실패.');
    console.log('이메일: '+Validator.isEmail(req.body.email));
    console.log('비번: '+Validator.equals(req.body.pw, req.body.pw_confirm));
    console.log('나이: '+Validator.isNumeric(req.body.age));
    console.log('성별: '+(Validator.equals(req.body.gender, 'male') || Validator.equals(req.body.gender, 'female')));

    res.send('회원가입 실패<br>원인: 유효성 검사결과');
  }
});

module.exports = router;
