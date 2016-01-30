var express = require('express');
var router = express.Router();

/* GET choose card. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* POST choose card */
router.post('/:card_id/:image_id', function(req, res, next) {
    var session;
    if (req.session.isLogin) session = req.session;
    else session = JSON.parse(req.body.my_session);


    // login check
    if (!session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');
        var Image = require('../models/image.js')

        var data = {
            'card_id': req.params.card_id,
            'useremail': session.userinfo.useremail,
            'username': session.userinfo.username,
            'image_id': req.params.image_id
        };
        console.log(data);

        Card.getById(data, function(status, card_msg) {
            if(status) {
                var async = require('async');
                async.waterfall([
                    function(callback) {
                        // 투표한적이 있는지 확인 후 투표 제거
                        Image.getById({ 'image_id' : card_msg.imageA }, function(status, msg) {
                            console.log('a검사');
                            if (!status)
                                res.send({ status: false, msg: '에러', data: msg });
                            if (msg.liker.indexOf(data.username) != -1) {
                                console.log('a실행');
                                var voteData = JSON.parse(JSON.stringify(data));
                                voteData.image_id = msg._id;
                                Card.postLikeCard(voteData, function(status, msg) {
                                    if (status) {
                                        return callback(null);
                                    } else res.send({ status: false, msg: '에러', data: msg });
                                });
                            } else {
                                return callback(null);
                            }
                        });
                    },
                    function(callback) {
                        // 투표한적이 있는지 확인 후 투표 제거
                        Image.getById({ 'image_id' : card_msg.imageB }, function(status, msg) {
                            console.log('b검사');
                            if (!status)
                                res.send({ status: false, msg: '에러', data: msg });
                            if (msg.liker.indexOf(data.username) != -1) {
                                console.log('b실행');
                                var voteData = JSON.parse(JSON.stringify(data));
                                voteData.image_id = msg._id;
                                Card.postLikeCard(voteData, function(status, msg) {
                                    if (status) {
                                        return callback(null);
                                    } else res.send({ status: false, msg: '에러', data: msg });
                                });
                            } else {
                                return callback(null);
                            }
                        });
                    },
                ],
                function(err, results) {
                    console.log('마지막 실행');
                    // 좋아요 선택
                    Card.postLikeCard(data, function(status, msg) {
                        if (status) {
                            Card.compareLike(data, function(status, done) {
                                if(status) {
                                    res.send({status: true, msg: '좋아요 누름', data: {like: msg.like, liker: msg.liker}});
                                } else
                                    res.send({ status: false, msg: '에러', data: msg });
                            });
                        }else
                            res.send({ status: false, msg: '에러', data: msg });
                    });
                });
            }
        });
    }
});

module.exports = router;
