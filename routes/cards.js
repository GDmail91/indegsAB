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
    Card.getMainCard(data, function (status, msg) {
        if (status) {
            res.send('카드 목록<br>목록: ' + msg);
        } else {
            console.log(msg);
            res.send('로딩 실패<br>상태: ' + msg);
        }
    });
});

/* POST image listing. */
router.post('/:card_id/images', function(req, res, next) {
    // login check
    if (!req.session.userinfo.isLogin) {
        res.send('로그인이 필요합니다.');
    } else {
        var AWS = require('aws-sdk');
        var fs = require('fs');

        var formidable = require('formidable');

        // GET FILE info
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            if (err) return res.redirect(303, '/error');
            if (err) {
                res.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'There was an error processing your submission. ' +
                    'Pelase try again.',
                };
                return res.redirect(303, '/contest/vacation-photo');
            }

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
                            res.send('성공 <br>사진id: '+msg._id);
                        } else res.send('실패');
                    });
                });
            });
        });
    }
});


/* POST card listing. */
router.post('/', function(req, res, next) {
    // login check
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
    // login check
    if (!req.session.userinfo.isLogin) {
        res.send('로그인이 필요합니다.');
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
                res.send('좋아요 누름 : '+msg);
            else
                res.send('에러 : '+msg);
        });
    }
});

/* POST new vote card */
router.post('/vote/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.userinfo.isLogin) {
        res.send('로그인이 필요합니다.');
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
            if (status) console.log('성공');
            else console.log('에러');

            //console.log(msg);
            res.send('Vote 작성 : '+msg);
        });
    }
});

/* PUT vote card */
router.put('/vote/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.userinfo.isLogin) {
        res.send('로그인이 필요합니다.');
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
            if (status) console.log('성공');
            else console.log('에러');

            //console.log(msg);
            res.send('Vote 누름 : '+msg);
        });
    }
});

module.exports = router;
