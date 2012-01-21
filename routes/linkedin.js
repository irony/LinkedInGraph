module.exports = function(app) {

	var linkedIn = require('linkedin-js')('3ao1sl5ji69k', 'TvW6VpdlFcsEuSEX', 'http://localhost:3000/auth');

	app.get('/auth', function(req, res) {

		linkedIn.getAccessToken(req, res, function(error, token) {
			req.session.token = token;

			res.redirect('/import');
		})
	});

	app.get('/import', function(req, res) {
		if(!req.session.token) {
			res.redirect('/auth');
			//TODO: redirecturl somehow
			return;
		}


		// console.log('token:', req.session.token);

		// TODO: find this person from the linkedIn id
		var me;
		
		console.log(me);
		
		// = db.getIndexedNode(); // = db.getNodeById(result.person.id);

		// db.query(_, "start n=(" + user6.id + ")\nmatch (n) -[r:follows]-> (m)\nreturn r, m.name");
		

		linkedIn.apiCall('GET', '/people/~:(id,first-name,last-name)', {
			token : req.session.token
		}, function(error, result) {

			if(error)
				throw JSON.stringify(error);
			
			console.log('found me', result);

			

		});

		linkedIn.apiCall('GET', '/people/~/connections', {
			token : req.session.token
		}, function(error, result) {

			if(error)
				res.render('map', {
					title : 'Error importing connections',
					json : JSON.stringify(error)
				});
			else {

				
				 result.values.forEach(function(person){

					 // Create node
					 

				 });
				
				
				console.log('connections received: ', result);

				res.render('map', {
					title : 'Connections imported',
					json : result
				});

			}
		});
	});
}