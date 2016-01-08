/******
 * CARDS PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET all card listing. */
router.get('/', function(req, res, next) {
    res.render('auth/join', { title: 'Card Page' });
});

/* POST card listing. */
router.post('/', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send('로그인이 필요합니다.');
    } else {
        var Card = require('../models/card.js');

        var data = {
            'useremail': req.session.userinfo.useremail,
            'author': req.session.userinfo.username,
            'imageA': req.body.imageA,
            'imageB': req.body.imageB,
            'title': req.body.title,
        };

        Card.post(data, function (status, msg) {
            if (status) {
                console.log('게시 완료');
                res.send('게시 완료<br>상태: ' + msg);
            } else {
                console.log(msg);
                res.send('게시 실패<br>상태: ' + msg);
            }
        });
    }
});
module.exports = router;
