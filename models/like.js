var mongoose = require('mongoose');
var crypto = require('crypto');

var likeSchema = mongoose.Schema({
    card_id: { type: Number, require: true },
    image_id: { type: String, require: true },
    useremail: {type: String, require: true },
});

// posting like process
likeSchema.statics.postLike = function(data, callback) {
    Like.getLikeByCard(data.card_id, function(status, msg) {
       if (status) {
           // 좋아요 취소
           Like.find({ card_id: data.card_id, image_id: data.image_id, useremail: data.useremail }).remove().exec(function(err, data) {
               callback(true, 'cancel');
           });
       } else {
           // 좋아요 취소
           new Like({
               card_id: data.card_id,
               image_id: data.image_id,
               useremail: data.useremail,
           }).save(function(err) {
               if (err) callback(false, err);
               else callback(true, 'plus');
           });
       }
    });
};

// get count of like by card
likeSchema.statics.getLikeByCard = function(data, callback) {
    Like.find({ card_id: data }, function(err, result) {
        if (err) {
            console.err(err);
            done(false, '좋아요 검색 에러');
        } else {
            if(result.length == 0) callback(false, '사용자 없음');
            else callback(true, result);
        }
    });
};

// get count of like by image
likeSchema.statics.getLikeByImage = function(data, callback) {
    Like.find({ image_id: data.image_id }, function(err, result) {
        if (err) {
            console.err(err);
            done(false, '좋아요 검색 에러');
        } else {
            if(result) callback(true, result);
            else callback(false, '사용자 없음');
        }
    });
};

// get count of like by user
likeSchema.statics.getLikeByUser = function(data, callback) {
    Like.find({ user_id: data.user_id }, function(err, result) {
        if (err) {
            console.err(err);
            done(false, '좋아요 검색 에러');
        } else {
            if(result) callback(true, result);
            else callback(false, '사용자 없음');
        }
    });
};

var Like = mongoose.model('Like', likeSchema);
module.exports = Like;
