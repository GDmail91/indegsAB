/******
 * USERS PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET join listing. */
router.get('/join', function(req, res, next) {
    res.render('auth/join', { title: 'Join Page' });
});

/* POST join listing. */
router.post('/join', function(req, res, next) {
    var User = require('../models/user.js');

    var data = {
        'email': req.body.email,
        'pw': req.body.pw,
        'pw_confirm': req.body.pw_confirm,
        'name': req.body.name,
        'age': req.body.age,
        'gender': req.body.gender
    };

    // validation check
    var Validator = require('validator');
    if(Validator.isEmail(data.email)  // email check
        && Validator.equals(data.pw, data.pw_confirm) // password confirm
        && Validator.isNumeric(data.age)  // number only
        && Validator.isAlpha  // charator only
        && (Validator.equals(data.gender, 'male') || Validator.equals(data.gender, 'female'))) {

        // Email registration
        User.joinCheck(data, function(status, msg) {
            if (status) {
                res.send('회원가입 성공.<br>가입 이메일: '+data.email);
            } else {
                // TODO backward process
                console.log('해당 이메일이 이미 있습니다.');
                res.send('회원가입 실패<br>원인: '+msg);
            }
        });

    } else {
        // TODO backward process
        console.log('유효성 검사 실패.');
        console.log('이메일: '+Validator.isEmail(data.email));
        console.log('비번: '+Validator.equals(data.pw, data.pw_confirm));
        console.log('이름: '+Validator.isNumeric(data.name));
        console.log('나이: '+Validator.isNumeric(data.age));
        console.log('성별: '+(Validator.equals(data.gender, 'male') || Validator.equals(data.gender, 'female')));

        res.send('회원가입 실패<br>원인: 유효성 검사결과');
    }
});

// TODO 회원정보 수정
/* GET update listing */
router.get('/update', function(req, res, next) {
    res.render('auth/update', { title: 'Update Page' });
});

// TODO 회원정보 수정
/* PUT update listing */
router.put('/update', function(req, res, next) {
    res.render('auth/update', { title: 'Update Page' });
});

/* GET login listing. */
router.get('/login', function(req, res, next) {
    res.render('auth/login', { title: 'Login Page' });
});

/* POST login listing. */
router.post('/login', function(req, res, next) {
    var User = require('../models/user.js');

    // TODO User 함수로 연결
    User.findOne({'email':req.body.email},function(err,result) {
        if (err) {
            console.err(err);
            throw err;
        }

        // Email check
        var crypto = require('crypto');
        if (result.pw == crypto.createHash("sha512").update(req.body.pw+result.salt).digest("hex")) {
            req.session.userinfo = {
                isLogin: true,
                username: result.name,
                useremail: result.email
            }
            // TODO redirecting
            res.send('로그인 성공 <br>로그인 이메일: '+result.email);
        } else {
            res.send('로그인 실패 <br>원인: 비밀번호 또는 이메일을 확인');
        }
    });
});

router.post('/logout', function(req, res, next) {
    req.session.userinfo = {};
    res.send('로그아웃 완료');
});

module.exports = router;
