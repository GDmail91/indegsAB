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
    postDate: { type: Date, default: Date.now },
});

// set _id as number
cardSchema.plugin(autoIncrement.plugin, 'Card');

/*
// after save process
cardSchema.post('save', function(doc) {
    console.log('삽입 완료: '+doc);
});
*/

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


var Card = mongoose.model('Card', cardSchema);
module.exports = Card;
