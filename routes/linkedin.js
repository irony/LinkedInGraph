module.exports = function(app) {

	var linkedIn = require('linkedin-js')('3ao1sl5ji69k', 'TvW6VpdlFcsEuSEX', 'http://localhost:3000/auth');
	var mongoose = require('mongoose');
	var db = mongoose.connect('mongodb://localhost/graphTest');
	
	
	var Person = mongoose.model('Person', require('../models/person.js'));
	var Connection = mongoose.model('Connection', require('../models/connection.js'));

	app.get('/auth', function(req, res) {

		linkedIn.getAccessToken(req, res, function(error, token) {
			req.session.token = token;

			res.redirect('/import');
		})
	});
	
	app.get('/progress', function(req, res){
		
		Person.find().stream().pipe(res);
	})

	app.get('/import', function(req, res) {
		if(!req.session.token) {
			res.redirect('/auth');
			//TODO: redirecturl somehow
			return;
		}


		
		// TODO: find this person from the linkedIn id
		var me;
		
		console.log(me);
		
				

		linkedIn.apiCall('GET', '/people/~:(id,first-name,last-name,picture-url,positions)', {
			token : req.session.token
		}, function(error, result) {

			if(error)
			{
				console.log('error ', error);
				return;
			}

			console.log('found me', result);

			// find me in the database
			Person.findOne({id : result.id}, function(error, person){

				// console.log('mongo found me', person);


				me = person || new Person(result);

				if (person){
					me.firstName = result.firstName;
					me.lastName = result.lastName;
					//console.log('found positions', result.positions);
					//me.company = result.positions.values.filter(function(position){ return position.isCurrent}).pop();
					//console.log('parsed company', me.company);
					me.id = result.id;
				}
				me.save();			
				app.currentUserId = me.id;
				// console.log('saved me', me);		
					
				// find my friends
				linkedIn.apiCall('GET', '/people/~/connections:(id,first-name,last-name,picture-url,positions)', {
					token : req.session.token
				}, function(error, result) {
		
					if(error){
						throw error;
					}
					else {
						 
						 // find all friends that are already in the database					
						 Person.where('id')
						 .in(result.values.map(function(item){return item.id}))
						 .run(function(error, dbFriends){
						 	
						 	console.log('found ' + dbFriends.length + ' friends in database');
						 	
							// replace my current friends with a a mix of existing persons in the db 							
						 	me.friends = result.values.map(function(item){
						 		var friend = dbFriends.filter(function(dbFriend){
						 			dbFriend.id == item.id;	
						 		}).pop();
						 		
						 		if (!friend) {
						 			friend = new Person(item); // or add to db for those that don't exist.
						 			friend.save();
						 		}
						 						 		
						 		return friend;
						 	});
						 	
						 	me.save();
						 	
							//console.log('me saved: ', me);

						 });
		
						res.render('map', {
							title : 'Connections imported',
							json : result
						});
		
					}
				});
			});

		});

	});
}