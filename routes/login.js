/******
 * LOGIN PAGE
 *
 ******/

var express = require('express');
var router = express.Router();

/* GET login listing. */
router.get('/', function(req, res, next) {
    res.render('auth/login', { title: 'Login Page' });
});

/* POST login listing. */
router.post('/', function(req, res, next) {
    // TODO form validation (email, pw)
    var user = new User({
        email: req.body.email,
        pw: req.body.pw
    });

    // TODO 유저 확인
    user.save(function(err) {
        if(err) return next(err);
        // TODO retrun 주소가 있을경우
        res.redirect(303, '/mypage' + uesr._id);
    });

    res.send('JOIN PAGE');
});

module.exports = router;
