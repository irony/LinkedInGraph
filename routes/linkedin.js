module.exports = function(app){
	
	var linkedIn = require('linkedin-js')('3ao1sl5ji69k', 'TvW6VpdlFcsEuSEX', 'http://localhost:3000/auth');
	
	app.get('/auth', function(req, res){
		linkedIn.getAccessToken(req, res, function (error, token){
			req.session.token = token;
			
			res.render('index', {title : 'Authenticated'});
		})	
	});
	
	
	app.get('/import', function(req, res){
		if (!req.session.token)
			res.redirect('/auth'); //TODO: redirecturl somehow
			
		
	});

}
