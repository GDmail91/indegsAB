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
    };
    Card.getMainCard(data, function (status, data) {
        if (status) {
            res.send({ status: true, msg: '카드목록 불러오기 성공', data: data });
        } else {
            console.log(data);
            res.send({ status: false, msg: '카드목록 불러오기 실패', data: data });
        }
    });
});

/* POST image listing. */
router.post('/:card_id/images', function(req, res, next) {
    // login check
    if (!req.mySession.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var AWS = require('aws-sdk');
        var fs = require('fs');

        var formidable = require('formidable');

        // GET FILE info
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            if (err) return res.redirect(303, '/error');

            // Read in the file, convert it to base64, store to S3
            var fileStream = fs.createReadStream(files.somefile.path);
            fileStream.on('error', function (err) {
                if (err) {
                    throw err;
                }
            });
            fileStream.on('open', function () {
                AWS.config.region = 'ap-northeast-2';
                var s3 = new AWS.S3();

                // image name hashing
                var crypto = require('crypto');
                var salt = Math.round((new Date().valueOf() * Math.random())) + "";
                var image_name = crypto.createHash("sha256").update(files.somefile.name + salt).digest("hex");

                // bucket info & file info
                var bucketName = 'indegs-image-storage';
                var keyName = 'images/'+image_name;

                s3.putObject({
                    Bucket: bucketName,
                    Key: keyName,
                    Body: fileStream
                }, function (err) {
                    if (err) {
                        throw err;
                    }
                    var Image = require('../models/image.js');

                    var data = {
                        image_url: keyName,
                        linked_card: req.params.card_id,
                        author: req.session.userinfo.username,
                    };
                    Image.postImage(data, function(status, msg) {
                        if(status) {
                            res.send({ status: true, msg: '업로드 성공', data: msg._id });
                        } else res.send({ status: false, msg: '업로드 실패' });
                    });
                });
            });
        });
    }
});


/* POST card listing. */
router.post('/', function(req, res, next) {
    var mySession = JSON.parse(req.cookies.mySession);
    req.session.isLogin = mySession.isLogin;
    req.session.userinfo = mySession.userinfo;
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
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
                res.send({ status: true, msg: '게시 완료', data: msg });
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
    var data = {
        'card_id': req.params.card_id
    };

    Card.getById(data, function(status, msg) {
        if(status) {
            res.send({ status: true, msg: '카드 불러오기 성공', data: msg });
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

/* POST choose card */
router.post('/choose/:card_id/:image_id', function(req, res, next) {
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
