var mongoose = require('mongoose');
var async = require('async');
var crypto = require('crypto');

var userSchema = mongoose.Schema({
    user_id: String,
    email: { type: String, require: true },
    pw: { type: String, require: true },
    salt: { type: String, require: true },
    name: { type: String, require: true },
    gender: { type: String, require: true },
    age: { type: Number, require: true },
    profile: { type: String, default: "" },
    job: { type: String, default: "" },
});

userSchema.index({ email: 1 }, { unique: true });



// Email registration process
userSchema.statics.joinCheck = function(data, callback) {
    async.waterfall([
            function(callback){   // 중복검사
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
            function(callback){  // 가입
                // user join process
                // password hashing
                var salt = Math.round((new Date().valueOf() * Math.random())) + "";
                var hashpass = crypto.createHash("sha512").update(data.pw+salt).digest("hex");

                new User({
                    email: data.email,
                    pw: hashpass,
                    salt: salt,
                    name: data.name,
                    gender: data.gender,
                    age: data.age
                }).save();

                callback(null);
            }
        ],
        function(err){
            if(err) callback(false, "회원가입 에러");  // error
            else callback(true, "success");  // success
        }
    );
};


var User = mongoose.model('User', userSchema);


module.exports = User;
