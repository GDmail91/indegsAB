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

// delete card by id
cardSchema.statics.deleteById = function(data, callback) {
    Card.findById(data.card_id).remove(function(err, result) {
        callback(true, result);
    });
};

// put card by id
cardSchema.statics.putById = function(data, callback) {
    Card.findOneAndUpdate({ _id: data.card_id }, { imageA: data.imageA, imageB: data.imageB, title: data.title }, function(err, result) {
        callback(true, result);
    });
};

// choose card
cardSchema.statics.postLikeCard = function(data, callback) {
    var Like = require('./like');
    var Image = require('./image');

    // Like Collection에 사용자 아이디와 게시물 아이디 추가
    Like.postLike(data, function(status, msg) {
        console.log(msg);
        // Image에 좋아요 수 증가
        // TODO waterfall 로 작성할 것
        if(status) {
            Image.getById({ image_id: data.image_id }, function(status, image) {

                if (status) {
                    var liker = [];
                    switch (msg) {
                        case 'plus': // increase process
                            image.like += 1;
                            liker = data.username;
                            break;
                        case 'cancel': // decrease process
                            if (image.like || image.like > 0) image.like -= 1;
                            else {
                                image.like = 0;
                            }
                            Image.findById(data.image_id, function(err, result) {
                                if(err) callback(err);
                                // liker remove
                                liker = result.liker.remove(data.username);
                            });
                            break;
                    }
                    Image.findOneAndUpdate({ _id: data.image_id }, { like: image.like, liker: liker }, { upsert: true, new: true}, function(err, result) {
                        if (err) callback(err);
                        else callback(true, result);
                    });
                } else {
                    callback(false, image);
                }
            });
        } else {
            callback(false, msg);
        }
    });
};

// get text vote in a image
cardSchema.statics.getVote = function(data, callback) {
    var Image = require('./image');
    Image.getById({ image_id: data.image_id }, function(status, image) {
        if (status) {
            // 같은글이 올라가있는 경우
            var hasImage = image.text_vote.filter(function(text_vote) {
                return text_vote.vote_title == data.vote_title;
            });

            if(hasImage.length == 0) {
                callback(false, 'Not exist');
            } else {
                callback(true, hasImage.pop());
            }

        } else {
            callback(false, image);
        }
    });
};

// create text vote
cardSchema.statics.postVoteCard = function(data, callback) {
    var Like = require('./like');
    Like.getLike({
        card_id: data.card_id,
        image_id: data.image_id,
        useremail: data.useremail
    }, function(status, result) {
        if(status) {
            var Image = require('./image');
            Image.getById({ image_id: data.image_id }, function(status, image) {
                if (status) {
                    var liker = image.text_vote;

                    // 같은글이 올라가있는 경우
                    var hasImage = image.text_vote.filter(function(text_vote) {
                        return text_vote.vote_title == data.vote_title;
                    });

                    if(hasImage.length == 0) {
                        liker.push({
                            vote_title: data.vote_title,
                            vote_owner: data.username,
                            vote_count: 1,
                            vote_member: [data.username]
                        });

                        Image.findOneAndUpdate({_id: data.image_id}, {text_vote: liker}, {
                            upsert: true,
                            new: true
                        }, function (err, result) {
                            if (err) callback(err);
                            else callback(true, result);
                        });
                    } else {
                        callback(false, 'Already voted');
                    }

                } else {
                    callback(false, image);
                }
            });
        } else {
            callback(false, 'Need set like');
        }
    });
};

// plus like into text vote
cardSchema.statics.putVoteLike = function(data, callback) {
    var Like = require('./like');
    Like.getLike({
        card_id: data.card_id,
        image_id: data.image_id,
        useremail: data.useremail
    }, function(status, result) {
        if(status) {
            var Image = require('./image');
            Image.getById({ image_id: data.image_id }, function(status, image) {
                if (status) {
                    // 해당이름의 Vote 검색
                    var result = image.text_vote.filter(function(text_vote) {
                        return text_vote.vote_title == data.vote_title;
                    });
                    if(result.length == 0) {
                        callback(false, 'Vote title isn`t exist');
                    } else {
                        console.log(result[0]);
                        // 투표 눌렀는지 확인
                        if(result[0].vote_member == data.username) {
                            // 눌렀을경우 투표 취소
                            var pos = result[0].vote_member.indexOf(data.username);
                            result[0].vote_member.splice(pos, 1);
                            result[0].vote_count -= 1;
                        } else {
                            // 안눌렀을 경우 투표
                            result[0].vote_member.push(data.username);
                            result[0].vote_count += 1;
                        }

                        Image.findOneAndUpdate({ _id: data.image_id }, { text_vote: result }, { upsert: true, new: true}, function(err, result) {
                            if (err) callback(err);
                            else callback(true, result);
                        });
                    }
                } else {
                    callback(false, image);
                }
            });
        } else {
            callback(false, 'Need set like');
        }
    });
};

var Card = mongoose.model('Card', cardSchema);
module.exports = Card;
