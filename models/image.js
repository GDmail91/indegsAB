var mongoose = require('mongoose');
var crypto = require('crypto');
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

var imageSchema = mongoose.Schema({
    image_url: { type: String, require: true },
    linked_card: { type: Number, require: true },
    author: { type: String, require: true },
    text_vote: [{
        vote_title: {type: String},
        vote_count: {type: Number},
        vote_owner: {type: String},
        vote_member: [{type: String}]
    }],
    liker: [{type: String}],
    like : { type: Number },
    postDate: { type: Date, default: Date.now },
});

// set _id as number
imageSchema.plugin(autoIncrement.plugin, 'Image');

// get image by id
imageSchema.statics.getById = function(data, callback) {
    Image.findById(data.image_id, function(err, result) {
        callback(true, result);
    });
};

// posting card process
imageSchema.statics.postImage = function(data, callback) {
    new Image({
        image_url: data.image_url,
        author: data.author,
    }).save(function(err, result) {
        if (err) callback(false, err);
        else callback(true, result);
    });
};

// put link card
imageSchema.statics.linkCard = function(data, callback) {
    Image.findOneAndUpdate({ _id: data.image_id }, { linked_card: data.linked_card }, function(err, result) {
        callback(true, result);
    });
};

//TODO text voting
// posting card process
imageSchema.statics.textVote = function(data, callback) {
    new Image({
        image_url: data.image_url,
        linked_card: data.card_id,
        author: data.author,
    }).save(function(err, result) {
        if (err) callback(false, err);
        else callback(true, result);
    });
};


var Image = mongoose.model('Image', imageSchema);
module.exports = Image;
