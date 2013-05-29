
/**
 * Module dependencies.
 */

var express = require('express');
  
var app = module.exports = express.createServer(express.cookieParser(), express.session({ secret : "papegoja"}));

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



// Routes
var routes = require('./routes')(app);


app.listen(process.env.PORT || 3002);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
