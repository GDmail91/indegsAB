/******
 * IMAGES PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET root listing. */
router.get('/', function(req, res, next) {
    res.send({ status: false, msg: '이미지 불러오기 실패', data: data });
});

/* GET image listing. */
router.get('/:image_url/:image_name', function(req, res, next) {
    // TODO duplicated
});

/* DELETE card listing. */
router.delete('/:card_id', function(req, res, next) {
    var Card = require('../models/card.js');
    var data = {
        'card_id': req.params.card_id
    };

    Card.deleteById(data, function(status, msg) {
        if(status) {
            res.send({ status: true, msg: '카드 삭제 성공', data: msg });
        } else {
            res.send({ status: false, msg: '카드 삭제 실패', data: msg });
        }
    })
});

/* PUT card listing. */
router.put('/:card_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        Card.getById({'card_id': req.params.card_id}, function (status, msg) {
            if(status) {
                if(msg)
                    if(msg.author == req.session.userinfo.username) {
                        var data = {
                            'card_id': req.params.card_id,
                            'imageA': req.body.imageA,
                            'imageB': req.body.imageB,
                            'title': req.body.title,
                        };

                        Card.putById(data, function (status, msg) {
                            if (status) {
                                // TODO mypage로 리다이렉트
                                // update 결과가 바뀌기 전 문장이 나오기 때문에 다시 불러옴
                                Card.getById({'card_id': req.params.card_id}, function (status, msg) {
                                    if (status) {
                                        res.send({ status: true, msg: '게시 완료', data: msg });
                                    } else res.send({ status: false, msg: '게시 실패', data: msg })
                                });
                            } else {
                                res.send({ status: false, msg: '게시 실패', data: msg });
                            }
                        });
                    } else res.send({ status: false, msg: '게시 실패', data: '권한이 없습니다' });
                else res.send({ status: false, msg: '게시 실패', data: '게시물이 없습니다' });
            } else res.send({ status: false, msg: '게시 실패', data: msg });
        });
    }
});

/* POST new vote card */
router.post('/vote/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'card_id': req.params.card_id,
            'useremail': req.session.userinfo.useremail,
            'username': req.session.userinfo.username,
            'image_id': req.params.image_id,
            'vote_title': req.body.vote_title,
        };

        Card.postVoteCard(data, function(status, msg) {
            if (status) {
                Card.getVote(data, function(status, msg) {
                    if (status) {
                        res.send({ status: true, msg: 'text vote 작성', data: msg });
                    } else {
                        res.send({ status: false, msg: 'text vote 가져오기 실패', data: msg });
                    }}) ;
            } else res.send({ status: false, msg: 'text vote 작성 실패', data: msg });
        });
    }
});

/* PUT vote card */
router.put('/vote/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'card_id': req.params.card_id,
            'useremail': req.session.userinfo.useremail,
            'username': req.session.userinfo.username,
            'image_id': req.params.image_id,
            'vote_title': req.body.vote_title
        };

        Card.putVoteLike(data, function(status, msg) {
            if (status) {
                Card.getVote(data, function(status, msg) {
                    if (status) {
                        res.send({ status: true, msg: 'text vote 투표', data: msg });
                    } else {
                        res.send({ status: false, msg: 'text vote 가져오기 실패', data: msg });
                    }
                }) ;
            } else res.send({ status: false, msg: 'text vote 투표 실패', data: msg });
        });
    }
});

module.exports = router;
