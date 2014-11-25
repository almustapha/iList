
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'cs391wp' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// iList Application Routes
app.get('/', routes.login);
app.get('/main', routes.main);
app.get('/login', routes.process_login);
app.post('/signup', routes.process_signup);
app.post('/like', routes.process_like);
app.post('/newlist', routes.new_list);
app.get('/getlists', routes.get_lists);
app.post('/addcontact', routes.add_contact);
app.get('/getcontacts', routes.get_contacts);
app.get('/navigate', routes.process_navigate);
app.get('/recommended', routes.get_recommended);
app.post('/addinterest', routes.process_interests);
app.get('/logout', routes.process_logout);
app.get('/nolists', routes.nolists);
app.get('/find', routes.find);
app.get('/interests', routes.process_get_interests);

app.listen(9321);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
