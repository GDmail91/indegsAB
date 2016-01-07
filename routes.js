var routes = require('./routes/index');
var join = require('./routes/join');
var login = require('./routes/login');
var main = require('./routes/main');
var choose = require('./routes/choose');
var result = require('./routes/result');

module.exports = function(app){
    app.use('/', routes);
    app.use('/join', join);
    app.use('/login', login);
    app.use('/main', main);
    app.use('/choose', choose);
    app.use('/result', result);

};
