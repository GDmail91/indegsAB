/******
 * CARDS PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET main card listing. */
router.get('/', function(req, res, next) {
    var Card = require('../models/card.js');

    // startID, endID
    var data = {
        'startId': req.query.startId,
        'term': req.query.term
    }
    Card.getMainCard(data, function (status, msg) {
        if (status) {
            res.send('카드 목록<br>목록: ' + msg);
        } else {
            console.log(msg);
            res.send('로딩 실패<br>상태: ' + msg);
        }
    });
});

/* POST card listing. */
router.post('/', function(req, res, next) {
    // login check
    //console.log(req.session.userinfo.isLogin);
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

/* GET card listing. */
router.get('/:card_id', function(req, res, next) {
    var Card = require('../models/card.js');
    var data = {
        'card_id': req.params.card_id
    };

    Card.getById(data, function(status, msg) {
        if(status) {
            res.send('게시물 결과<br> 결과: '+msg);
        } else {
            res.send('게시물 없음<br> 결과: '+msg);
        }
    })
});

/* POST choose card */
router.post('/choose/:card_id/:image_id', function(req, res, next) {
    var Card = require('../models/card.js');

    // TODO need image id
    var data = {
        'card_id': req.params.card_id,
        'useremail': req.session.userinfo.useremail,
        'username': req.session.userinfo.username,
        'image_id': req.params.image_id
    };

    Card.postLikeCard(data, function(status, msg) {
        if (status) console.log('성공');
        else console.log('에러');

        //console.log(msg);
        res.send('좋아요 누름 : '+msg);
    });
});

module.exports = router;
