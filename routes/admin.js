/******
 * ADMIN PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET users list */
router.get('/users', function(req, res, next) {
    var data = {
        'page_id': req.query.pid,
        'start_id': req.query.start_id
    };

    // 컨트롤러 서버인지 확인
    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
            || req.connection.remoteAddress;
    };
    if(getClientAddress(req) == '::1'
        || getClientAddress(req) == '::ffff:127.0.0.1'
        || getClientAddress(req) == '::ffff:128.199.75.74') { // IPv6의 루프백 주소
        var User = require('../models/user');
        User.getList(data, function(status, result_data) {
            if (!status) return res.send({ status: false, msg: '에러 발생', data: result_data });
            res.send({ status: true, msg: '유저 목록', data: result_data });
        });
    } else {
        res.send('잘못된 접근입니다.');
    }
});

/* DELETE user */
router.delete('/users', function(req, res, next) {
    var data = {
        'selected_id': JSON.parse(req.body.selected_id)
    };

    // 컨트롤러 서버인지 확인
    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
            || req.connection.remoteAddress;
    };
    if(getClientAddress(req) == '::1'
        || getClientAddress(req) == '::ffff:127.0.0.1'
        || getClientAddress(req) == '::ffff:128.199.75.74') { // IPv6의 루프백 주소
        console.log(data.selected_id);
        data.user_id = data.selected_id;
        var User = require('../models/user');
        User.deleteById(data, function(status, result_data) {
            if (!status) return res.send({ status: false, msg: '에러 발생', data: result_data});
            res.send({ status: true, msg: '삭제 완료', data: result_data});
        });
    } else {
        res.send('잘못된 접근입니다.');
    }
});


/* GET cards list */
router.get('/cards', function(req, res, next) {
    var data = {
        'page_id': req.query.pid,
        'start_id': req.query.start_id
    };

    // 컨트롤러 서버인지 확인
    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
            || req.connection.remoteAddress;
    };
    if(getClientAddress(req) == '::1'
        || getClientAddress(req) == '::ffff:127.0.0.1'
        || getClientAddress(req) == '::ffff:128.199.75.74') { // IPv6의 루프백 주소
        var Card = require('../models/card');
        Card.getMainCard(data, function(status, result_data) {
            if (!status) return res.send({ status: false, msg: '에러 발생', data: result_data });
            res.send({ status: true, msg: '카드 목록', data: result_data });
        });
    } else {
        res.send('잘못된 접근입니다.');
    }
});

/* DELETE card */
router.delete('/cards', function(req, res, next) {
    var data = {
        'selected_id': JSON.parse(req.body.selected_id)
    };

    // 컨트롤러 서버인지 확인
    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
            || req.connection.remoteAddress;
    };
    if(getClientAddress(req) == '::1'
        || getClientAddress(req) == '::ffff:127.0.0.1'
        || getClientAddress(req) == '::ffff:128.199.75.74') { // IPv6의 루프백 주소
        data.card_id = data.selected_id;
        var Card = require('../models/card');
        Card.deleteById(data, function(status, result_data) {
            if (!status) return res.send({ status: false, msg: '에러 발생', data: result_data});
            res.send({ status: true, msg: '삭제 완료', data: result_data});
        });
    } else {
        res.send('잘못된 접근입니다.');
    }
});

/* GET image list */
router.get('/images', function(req, res, next) {
    var data = {
        'page_id': req.query.pid,
        'start_id': req.query.start_id
    };

    // 컨트롤러 서버인지 확인
    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
            || req.connection.remoteAddress;
    };
    if(getClientAddress(req) == '::1'
        || getClientAddress(req) == '::ffff:127.0.0.1'
        || getClientAddress(req) == '::ffff:128.199.75.74') { // IPv6의 루프백 주소
        var Images = require('../models/image');
        Images.getList(data, function(status, result_data) {
            if (!status) return res.send({ status: false, msg: '에러 발생', data: result_data });
            res.send({ status: true, msg: '이미지 목록', data: result_data });
        });
    } else {
        res.send('잘못된 접근입니다.');
    }
});

module.exports = router;
