var mongoose = require('mongoose');
var crypto = require('crypto');
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

var cardSchema = mongoose.Schema({
    imageA: { type: String, require: true },
    imageB: { type: String, require: true },
    title: { type: String, require: true },
    useremail: { type: String, require: true },
    // author: { type: String, require: true, ref: 'Users' }, Users collection 참조
    author: { type: String, require: true },
    like : { type: Number },
    postDate: { type: Date, default: Date.now },
});

// set _id as number
cardSchema.plugin(autoIncrement.plugin, 'Card');


// getting main card process
cardSchema.statics.getMainCard = function(data, callback) {
    // if have 'startId' searching at the id
    //console.log(data.startId);
    if (data.term == undefined) data.term = 5;
    if (data.startId) {
        Card.findById(data.startId, function(err, result) {
            // postDate 기준으로 내림차순 정렬, 상위 5개
            if(err || result.length == 0) {
                callback(false, err);
            } else {
                // Card.find({'postDate': {$lt: result.postDate}}).sort({postDate: -1}).limit(data.term).populate('author').exec(function (err, result) { populate 이용 id 연결
                Card.find({'postDate': {$lt: result.postDate}}).sort({postDate: -1}).limit(data.term).find(function (err, result) {
                    console.log(result);
                    if (err) callback(false, err);
                    else callback(true, result);
                });
            }
        });
    } else { // if no have 'startId' searching at the recent card
        // postDate 기준으로 내림차순 정렬, 상위 5개
        // Card.find().sort({postDate: -1}).limit(data.term).populate('author').exec(function(err,result){ populate 이용 id 연결
        Card.find().sort({postDate: -1}).limit(data.term).find(function(err,result){
            if(err) return callback(false, err);
            if(result.length == 0) return callback(false, '데이터가 없습니다.');
            var User = require('./user');
            var length = 1;
            result.forEach(function(val, index, arr) {
                User.getById({user_id: val.author}, function(user_result, data) {
                    if (user_result) {
                        result[index].author = data.username;
                        if (length == result.length) callback(true, result);
                        else length++;
                    } else {
                        // TODO duplicated
                        // ID로 검색이안됬을 경우 이름으로 검색( 추후 삭제)
                        User.getByName({username: val.author}, function(user_result, data) {
                            if(user_result) {
                                result[index].author = data.username;
                                if (length == result.length) callback(true, result);
                                else length++;
                            } else return callback(false, data);
                        });
                    }
                });
            });
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
    }).save(function(err, card) {
        if (err) callback(false, err);
        else callback(true, card.id);
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
    var Image = require('./image');
    Card.find({ _id: {"$in":data.card_id }}, function (err, result) {
        var async = require('async');
        var image_ids = [];
        var length = 0;
        result.forEach(function(val,index, arr) {
            image_ids.push(parseInt(val.imageA));
            image_ids.push(parseInt(val.imageB));
            length++;
            if (length == result.length) {
                imageRemove(image_ids);
            }
        });
        function imageRemove(image_ids) {
            Image.find({_id: {"$in": image_ids}}).remove(function(err, result) {
                console.log(result);
                if(err) return callback(false, '이미지 삭제중 에러');
                cardRemove();
            });
        }
    });
    function cardRemove() {
        console.log('카드 삭제 실행');
        Card.find({_id: {"$in": data.card_id}}).remove(function (err, result) {
            callback(true, result);
        });
    }
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
                            if (!image.like) image.like=0;
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

cardSchema.statics.compareLike = function (data, callback) {
    var Image = require('./image');
    var async = require('async');
    var imageA, imageB, like;
    async.waterfall([
            function(callback) {
                Image.getById({ 'image_id' : Card.imageA }, function(status, msg) {
                    imageA = msg;
                    if (status) return callback(null);
                    callback(msg);
                });
            },
            function(callback) {
                Image.getById({ 'image_id' : Card.imageB }, function(status, msg) {
                    imageB = msg;
                    if (status) return callback(null);
                    callback(msg);
                });
            },
        ],
        function(err, results) {
            if(imageA > imageB) {
                like = Card.imageA;
            } else if(imageB > imageA) {
                like = Card.imageB;
            }
            Card.findOneAndUpdate({ _id: data.card_id }, { like: like }, { upsert: true, new: true}, function(err, result) {
                if (err) callback(err);
                else callback(true, result);
            });
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
                    var chageVote = image.text_vote.filter(function(text_vote) {
                        return text_vote.vote_title == data.vote_title;
                    });
                    if(chageVote.length == 0) {
                        callback(false, 'Vote title isn`t exist');
                    } else {
                        console.log(chageVote);
                        // 투표 눌렀는지 확인
                        if(chageVote[0].vote_member == data.username) {
                            // 눌렀을경우 투표 취소
                            var pos = chageVote[0].vote_member.indexOf(data.username);
                            chageVote[0].vote_member.splice(pos, 1);
                            chageVote[0].vote_count -= 1;
                        } else {
                            // 안눌렀을 경우 투표
                            chageVote[0].vote_member.push(data.username);
                            chageVote[0].vote_count += 1;
                        }
                        console.log(image.text_vote);
                        image.text_vote[data.vote_title] = chageVote[0];
                        var result = image.text_vote;

                        console.log(result);

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

// get by user id
cardSchema.statics.getByUser = function(data, callback) {
    if (data.term == undefined) data.term = 5;
    if (data.startId) {
        Card.findById(data.startId).find({ author: data.username }, function(err, result) {
            // postDate 기준으로 내림차순 정렬, 상위 5개
            if(err || result.length == 0) {
                callback(false, err);
            } else {
                Card.find({'postDate': {$lt: result.postDate}}).sort({postDate: -1}).limit(data.term).find(function (err, result) {
                    if (err) callback(false, err);
                    else callback(true, result);
                });
            }
        });
    } else { // if no have 'startId' searching at the recent card
        // postDate 기준으로 내림차순 정렬, 상위 5개
        Card.find({ author: data.username }).sort({postDate: -1}).limit(data.term).find(function(err,result){
            if(err) {
                callback(false, err);
            }
            else if (result.length == 0) callback(false, '데이터가 없습니다.');
            else callback(true, result);
        });
    }
};

var Card = mongoose.model('Card', cardSchema);
module.exports = Card;
