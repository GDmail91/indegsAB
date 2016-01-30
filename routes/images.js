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

module.exports = router;
