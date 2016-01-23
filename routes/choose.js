var express = require('express');
var router = express.Router();

/* GET choose card. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* POST choose card */
router.post('/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'card_id': req.params.card_id,
            'useremail': req.session.userinfo.useremail,
            'username': req.session.userinfo.username,
            'image_id': req.params.image_id
        };

        Card.postLikeCard(data, function(status, msg) {
            if (status)
                res.send({ status: true, msg: '좋아요 누름', data: {like: msg.like, liker: msg.liker } });
            else
                res.send({ status: false, msg: '에러', data: msg });
        });
    }
});

module.exports = router;
