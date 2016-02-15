var mongoose = require('mongoose');
var async = require('async');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
    user_id: String,
    email: { type: String, require: true },
    pw: { type: String, require: true },
    salt: { type: String, require: true },
    username: { type: String, require: true },
    gender: { type: String, require: true },
    age: { type: Number, require: true },
    profile: { type: String, default: "" },
    job: { type: String, default: "" },
});

userSchema.index({ email: 1 }, { unique: true });

// User list getter
userSchema.statics.getList = function(data, done) {
    if (data.term == undefined) data.term = 5;
    if (data.startId) {
        User.findById(data.startId, function(err, result) {
            // ID 기준으로 내림차순 정렬, 상위 5개
            if(err || result.length == 0) {
                done(false, err);
            } else {
                User.find({'_id': {$lt: result._id}}).sort({_id: -1}).limit(data.term).find(function (err, result) {
                    if (err) done(false, err);
                    else done(true, result);
                });
            }
        });
    } else { // if no have 'startId' searching at the recent database
        // ID 기준으로 내림차순 정렬, 상위 5개
        User.find().sort({_id: -1}).limit(data.term).find(function(err,result){
            if(err) {
                done(false, err);
            }
            else if (result.length == 0) done(false, '데이터가 없습니다.');
            else done(true, result);
        });
    }
};

// User info getter
userSchema.statics.getByName = function(data, done) {
    User.findOne({'username':data.username}, function(err, result) {
        if (err) {
            console.err(err);
            done(false, '사용자 검색 에러');
        } else {
            if(result) done(true, result);
            else done(false, '사용자 없음');
        }
    });
};

// User info getter
userSchema.statics.getByEmail = function(data, done) {
    User.findOne({'useremail':data.useremail}, function(err, result) {
        if (err) {
            console.err(err);
            done(false, '사용자 검색 에러');
        } else {
            if(result) done(true, result);
            else done(false, '사용자 없음');
        }
    });
};

// Email registration process
userSchema.statics.joinCheck = function(data, done) {
    async.waterfall([
            function(callback){   // email 중복검사
                User.findOne({'email':data.email},function(err,result){
                    if (err) {
                        console.err(err);
                        callback(err);
                    } else if (result) {
                        done(false, "이메일 중복 에러");
                    } else {
                        callback(null);
                    }
                });
            },
            function(callback) {    // nickname 중복 검사
                User.findOne({'username':data.username}, function(err, result) {
                    console.log(result);
                    if(err) {
                        console.err(err);
                        callback(err);
                    } else if (result) {
                        if (result.length == 0) done(false, '닉네임 중복 에러');
                    } else {
                        callback(null);
                    }
                })
            },
            function(callback){  // 가입
                // user join process
                // password hashing
                var salt = Math.round((new Date().valueOf() * Math.random())) + "";
                var hashpass = crypto.createHash("sha512").update(data.pw+salt).digest("hex");

                new User({
                    email: data.email,
                    pw: hashpass,
                    salt: salt,
                    username: data.username,
                    gender: data.gender,
                    age: data.age
                }).save();

                callback(null);
            }
        ],
        function(err){
            if(err) done(false, "회원가입 에러");  // error
            else done(true, "success");  // success
        }
    );
};

userSchema.statics.updateUser = function(data, callback) {
    // user update process
    User.findOneAndUpdate({ useremail: data.useremail }, { gender: data.gender, age: data.age, job: data.job, profile: data.profile }, { upsert: true, new: true}, function(err, result) {
        if (err) callback(err);
        else callback(true, result);
    });
};

userSchema.statics.deleteById = function(data, callback) {
    // user delete process
    User.find({ _id: {"$in":data.user_id }}).remove(function(err, result) {
        callback(true, result);
    });
};

var User = mongoose.model('User', userSchema);


module.exports = User;
