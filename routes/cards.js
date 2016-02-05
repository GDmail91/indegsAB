/******
 * CARDS PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET main card listing. */
router.get('/', function(req, res, next) {
    var Card = require('../models/card.js');
    var Image = require('../models/image.js');

    // startID, endID
    var data = {
        'startId': req.query.startId,
        'term': req.query.term
    };
    Card.getMainCard(data, function (status, msg) {
        if (status) {
            var processed = 0;
            var resultMsg = JSON.parse(JSON.stringify(msg));
            msg.forEach(function (val, index, arr) {
                var async = require('async');
                async.waterfall([
                        function (callback) {
                            Image.getById({'image_id': val.imageA}, function (status, msg) {
                                resultMsg[index].imageA = msg;
                                if (status) return callback(null);
                                callback(msg);
                            });
                        },
                        function (callback) {
                            Image.getById({'image_id': val.imageB}, function (status, msg) {
                                resultMsg[index].imageB = msg;
                                if (status) return callback(null);
                                callback(msg);
                            });
                        },
                    ],
                    function (err, results) {
                        processed++;
                        if (processed == msg.length) {
                            console.log(resultMsg);
                            res.send({status: true, msg: '카드목록 불러오기 성공', data: resultMsg});
                        }
                    });
            });
        } else {
            res.send({ status: false, msg: '카드목록 불러오기 실패', data: resultMsg });
        }
    });
});

/* POST image listing. */
router.post('/images', function(req, res, next) {
    var session;
    if (req.session.isLogin) session = req.session;
    else session = JSON.parse(req.body.my_session);

    // login check
    if (!session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Image = require('../models/image.js');

        Image.postImage(JSON.parse(req.body.data), function(status, msg) {
            if(status) {
                res.send({ status: true, msg: '업로드 성공', data: msg._id });
            } else res.send({ status: false, msg: '업로드 실패' });
        });
    }
});


/* POST card listing. */
router.post('/', function(req, res, next) {
    var session;
    if (req.session.isLogin) session = req.session;
    else session = JSON.parse(req.body.my_session);

    // login check
    if (!session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'useremail': session.userinfo.useremail,
            'author': session.userinfo.username,
            'imageA': req.body.imageA,
            'imageB': req.body.imageB,
            'title': req.body.title,
        };

        Card.postCard(data, function (status, msg) {
            if (status) {
                var Image = require('../models/image.js');

                var data = { linked_card: msg };

                Image.linkCard(data, function (status, msg) {
                    if(status) {
                        console.log('게시 완료');
                        // TODO mypage로 리다이렉트
                        res.send({ status: true, msg: '게시 완료', data: data.linked_card });
                    } else {
                        console.log(msg);
                        res.send({ status: false, msg: '게시 실패', data: msg });
                    }
                });
            } else {
                console.log(msg);
                res.send({ status: false, msg: '게시 실패', data: msg });
            }
        });
    }
});

/* GET card listing. */
router.get('/:card_id', function(req, res, next) {
    var Card = require('../models/card.js');
    var Image = require('../models/image.js');
    var data = {
        'card_id': req.params.card_id
    };

    Card.getById(data, function(status, msg) {
        if(status) {
            var imageA;
            var imageB;
            var async = require('async');
            async.waterfall([
                    function(callback) {
                        Image.getById({ 'image_id' : msg.imageA }, function(status, msg) {
                            imageA = msg;
                            if (status) return callback(null);
                            callback(msg);
                        });
                    },
                    function(callback) {
                        Image.getById({ 'image_id' : msg.imageB }, function(status, msg) {
                            imageB = msg;
                            if (status) return callback(null);
                            callback(msg);
                        });
                    },
                ],
                function(err, results) {
                    if (imageA && imageB) {
                        msg.imageA = JSON.stringify(imageA);
                        msg.imageB = JSON.stringify(imageB);
                        //console.log(msg);
                        res.send({ status: true, msg: '카드 불러오기 성공', data: msg });
                    } else {
                        res.send({ status: false, msg: '카드 검색 실패', data: msg });
                    }
                });
        } else {
            res.send({ status: false, msg: '카드 검색 실패', data: msg });
        }
    })
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
    var session;
    if (req.session.isLogin) session = req.session;
    else session = JSON.parse(req.body.my_session);

    // login check
    if (!session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        Card.getById({'card_id': req.params.card_id}, function (status, msg) {
            if(status) {
                if(msg)
                if(msg.author == session.userinfo.username) {
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
    var session;
    if (req.session.isLogin) session = req.session;
    else session = JSON.parse(req.body.my_session);

    // login check
    if (!session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'card_id': req.params.card_id,
            'image_id': req.params.image_id,
            'useremail': session.userinfo.useremail,
            'username': session.userinfo.username,
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
    var session;
    if (req.session.isLogin) session = req.session;
    else session = JSON.parse(req.body.my_session);

    // login check
    if (!session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'card_id': req.params.card_id,
            'useremail': session.userinfo.useremail,
            'username': session.userinfo.username,
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
