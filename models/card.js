var mongoose = require('mongoose');
var crypto = require('crypto');
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

var cardSchema = mongoose.Schema({
    imageA: { type: String, require: true },
    imageB: { type: String, require: true },
    title: { type: String, require: true },
    useremail: { type: String, require: true },
    author: { type: String, require: true },
    like : { type: Number },
    postDate: { type: Date, default: Date.now },
});

// set _id as number
cardSchema.plugin(autoIncrement.plugin, 'Card');


// getting main card process
cardSchema.statics.getMainCard = function(data, callback) {
    // if have 'startId' searching at the id
    console.log(data.startId);
    if (data.startId) {
        Card.findById(data.startId, function(err, result) {
            // postDate 기준으로 내림차순 정렬, 상위 5개
            Card.find({'postDate': {$lt: result.postDate}}).sort({postDate: -1}).limit(5).find(function(err,result){
                if(err) callback(false, err);
                else callback(true, result);
            });
        });
    } else { // if no have 'startId' searching at the recent card
        console.log('여기 실행');
        // postDate 기준으로 내림차순 정렬, 상위 5개
        Card.find().sort({postDate: -1}).limit(5).find(function(err,result){
            if(err) callback(false, err);
            else callback(true, result);
        });
    }

};

// posting card process
cardSchema.statics.postCard = function(data, callback) {
    new Card({
        imageA: data.imageA,
        imageB: data.imageB,
        title: data.title,
        useremail: data.useremail,
        author: data.author
    }).save(function(err) {
        if (err) callback(false, err);
        else callback(true, 'success');
    });
};

// get card by id
cardSchema.statics.getById = function(data, callback) {
    Card.findById(data.card_id, function(err, result) {
        callback(true, result);
    });
};


// choose card
// TODO need like model
cardSchema.statics.postLikeCard = function(data, callback) {
    // var User= require('./user');
    var Like = require('./like');

    // Like Collection에 사용자 아이디와 게시물 아이디 추가
    Like.postLike(data, function(status, msg) {
        // Card에 좋아요 수 증가
        // TODO waterfall 로 작성할 것
        if(status) {
            Card.getById({ card_id: data.card_id }, function(status, msg) {
                if (status) {
                    if (msg.like) msg.like += 1;
                    else msg.like = 1;

                    Card.findOneAndUpdate({ _id: data.card_id }, { like:msg.like }, { upsert: true, new: true}, function(err, result) {
                        if (err) callback(err);
                        else callback(true, result);
                    });
                } else {
                    callback(false, msg);
                }
            });
        } else {
            callback(false, msg);
        }
    });
};

var Card = mongoose.model('Card', cardSchema);
module.exports = Card;
