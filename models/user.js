var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    user_id: String,
    email: String,
    pw: String,
    gender: String,
    age: Number,
    profile: { type: String, default: "" },
    name: { type: String, default: "" },
    job: { type: String, default: "" },
});

userSchema.index({ user_id: 1 }, { unique: true });

/*
userSchema.methods.getUserEmail = function(cb){
    return User.find({ email: this.email }, cb);

};*/

var User = mongoose.model('User', userSchema);
module.exports = User;
