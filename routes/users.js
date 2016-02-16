/******
 * USERS PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET user listing */
router.get('/names', function(req, res, next) {
    // TODO chage to ID
    var User = require('../models/user.js');
    var data = {
        'username': req.query.username
    };
    User.getByName(data, function(status, data) {
        if (status) {
            res.send({ status: true, msg: '사용자 검색 성공', data: data });
        } else {
            res.send({ status: false, msg: '사용자 검색 실패', data: data });
        }
    });
});

/* GET user by email listing */
router.get('/emails', function(req, res, next) {
    var User = require('../models/user.js');
    var data = {
        'useremail': req.query.useremail
    };
    User.getByEmail(data, function(status, data) {
        if (status) {
            res.send({ status: true, msg: '사용자 검색 성공', data: data });
        } else {
            res.send({ status: false, msg: '사용자 검색 실패', data: data });
        }
    });
});

/* POST join listing. */
router.post('/join', function(req, res, next) {
    var User = require('../models/user.js');

    var data = {
        'email': req.body.email,
        'pw': req.body.pw,
        'pw_confirm': req.body.pw_confirm,
        'username': req.body.username,
        'age': req.body.age,
        'gender': req.body.gender
    };

    // validation check
    var validation = /[a-힣]/;
    var Validator = require('validator');
    if(Validator.isEmail(data.email)  // email check
        && Validator.equals(data.pw, data.pw_confirm) // password confirm
        && Validator.isNumeric(data.age)  // number only
        && validation.test(data.username) // character only
        && (Validator.equals(data.gender, 'male') || Validator.equals(data.gender, 'female'))) {

        // Email registration
        User.joinCheck(data, function(status, msg) {
            if (status) {
                res.send({ status: true, msg: '회원가입 성공', data: data.email });
            } else {
                // TODO backward process
                res.send({ status: false, msg: '회원가입 실패', data: msg });
            }
        });

    } else {
        // TODO backward process
        console.log('유효성 검사 실패.');
        console.log('이메일: '+Validator.isEmail(data.email));
        console.log('비번: '+Validator.equals(data.pw, data.pw_confirm));
        console.log('이름: '+validation.test(data.username));
        console.log('나이: '+Validator.isNumeric(data.age));
        console.log('성별: '+(Validator.equals(data.gender, 'male') || Validator.equals(data.gender, 'female')));

        res.send({ status: false, msg: '회원가입 실패', data: '유효성 검사 실패' });
    }
});

// TODO 회원정보 수정
/* GET update listing */
router.get('/update', function(req, res, next) {
    res.render('auth/update', { title: 'Update Page' });
});

// TODO 회원정보 수정
/* PUT update listing */
router.put('/', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var User = require('../models/user.js');
        var data = {
            //useremail: req.session.userinfo.useremail,
            username: req.session.userinfo.username,
            gender: req.body.gender,
            age: req.body.age,
            job: req.body.job,
            profile: req.body.profile
        };

        User.updateUser(data, function (status, msg) {
            if (status) {
                res.send({status: true, msg: '정보 수정 성공', data: msg});
            } else res.send({status: false, msg: '정보 수정 실패', data: msg});
        });
    }
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

        if (result) {
            // Email check
            var crypto = require('crypto');
            if (result.pw == crypto.createHash("sha512").update(req.body.pw+result.salt).digest("hex")) {
                // TODO redirecting
                res.send({ status: true, msg: '로그인 성공', data: { email: result.email, username: result.username }});
            } else {
                res.send({ status: false, msg: '로그인 실패', data: '비밀번호 오류' });
            }
        } else {
            res.send({ status: false, msg: '로그인 실패', data: '계정없음' });
        }

    });
});

module.exports = router;
