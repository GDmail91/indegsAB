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
    console.log(req.session.userinfo.isLogin);
    if (!req.session.userinfo.isLogin) {
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

        Card.postCard(data, function (status, msg) {
            if (status) {
                console.log('게시 완료');
                // TODO mypage로 리다이렉트
                res.send('게시 완료<br>상태: ' + msg);
            } else {
                console.log(msg);
                res.send('게시 실패<br>상태: ' + msg);
            }
        });
    }
});

router.get('/:id', function(req, res, next) {
    var Card = require('../models/card.js');
    var data = {
        'card_id': req.params.id
    };

    Card.getById(data, function(status, msg) {
        if(status) {
            console.log(msg);
            res.send('게시물 결과<br> 결과: '+msg);
        } else {
            console.log('게시물 없음');
            res.send('게시물 없음<br> 결과: '+msg);
        }
    })
});

module.exports = router;
