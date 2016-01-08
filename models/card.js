var mongoose = require('mongoose');
var async = require('async');
var crypto = require('crypto');

var cardSchema = mongoose.Schema({
    card_id: { type: Number },
    imageA: { type: String, require: true },
    imageB: { type: String, require: true },
    title: { type: String, require: true },
    useremail: { type: String, require: true },
    author: { type: String, require: true },
    postDate: { type: Date, default: Date.now },
});

//cardSchema.index({ user_id: 1 }, { unique: true });

cardSchema.statics.post = function(data, done) {
    new Card({
        imageA: data.imageA,
        imageB: data.imageB,
        title: data.title,
        useremail: data.useremail,
        author: data.author
    }).save(function(err) {
        if (err) done(false, err);
        else done(true, "success");
    });
};


var Card = mongoose.model('Card', cardSchema);


module.exports = Card;
