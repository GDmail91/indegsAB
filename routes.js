var routes = require('./routes/index');
var users= require('./routes/users');
var main = require('./routes/main');
var cards = require('./routes/cards');
var choose = require('./routes/choose');
var result = require('./routes/result');

module.exports = function(app){
    app.use('/', routes);
    app.use('/users', users);
    app.use('/main', main);
    app.use('/cards', cards);
    app.use('/choose', choose);
    app.use('/result', result);

};
