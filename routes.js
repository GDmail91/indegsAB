var routes = require('./routes/index');
var users = require('./routes/users');
var cards = require('./routes/cards');
var choose = require('./routes/choose');
var result = require('./routes/result');
var images = require('./routes/images');
var admin = require('./routes/admin');

module.exports = function(app){
    app.use('/', routes);
    app.use('/users', users);
    app.use('/cards', cards);
    app.use('/choose', choose);
    app.use('/result', result);
    app.use('/images', images);
    app.use('/admin', admin);

};
