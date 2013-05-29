module.exports = function(app) {

	var mongoose = require('mongoose');
	var db = mongoose.connect(process.env['MONGOHQ_URL'] || 'mongodb://localhost/graphTest');
	var async = require('async');
	var linkedInApi = {userName : '3ao1sl5ji69k', password: 'TvW6VpdlFcsEuSEX'};
	
	var Person = mongoose.model('Person', require('../models/person.js'));
	var Connection = mongoose.model('Connection', require('../models/connection.js'));


	app.get('/auth', function(req, res) {
		var callbackUrl = "http://" + req.headers.host + "/import";

		var linkedIn = require('linkedin-js')(linkedInApi.userName, linkedInApi.password, callbackUrl);
		linkedIn.getAccessToken(req, res, function(error, token) {
			req.session.token = token;

			res.redirect('/map');
		});
	});
	
	app.get('/progress', function(req, res){
		
		Person.find().stream().pipe(res);
	});

	app.get('/import', function(req, res) {
		if(!req.session.auth) {
		console.log(req)
			res.redirect('/auth');
			//TODO: redirecturl somehow
			return;
		}


		
		// TODO: find this person from the linkedIn id
		var me;
		
		console.log(me);
		
		var baseUrl = req.host + ":" + req.headers.protocol;

		var linkedIn = require('linkedin-js')(linkedInApi.userName, linkedInApi.password, baseUrl + '/auth');

		linkedIn.apiCall('GET', '/people/~:(id,first-name,last-name,picture-url,positions)', {
			token : req.session.auth
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
				if (error){
					console.log('error', error);
					return;
				}

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
					
				// find my friends from LinkedIn
				linkedIn.apiCall('GET', '/people/~/connections:(id,first-name,last-name,picture-url,positions)', {
					token : req.session.token
				}, function(error, result) {
		
					if(error){
						throw error;
					}
					else {

						console.log('searching database for friends...');
						
						// find all friends that are already in the database
						Person.where('id')
						.in(result.values.map(function(item){return item.id;}))
						.run(function(error, dbFriends){
							console.log('found ' + dbFriends.length + ' friends in database');

							// replace my current friends with a a mix of existing persons in the db
							async.map(result.values, function(item, callback){
								var self = this;
								var friend = dbFriends.filter(function(dbFriend){
									return dbFriend.id == item.id;
								}).pop();
								
								if (!friend) {
									friend = new Person(item); // or add to db for those that don't exist.
									friend.save(function(){
										console.log('saving friend', friend.id);
										callback(null, friend);
									});
								} else {
									console.log('found friend', friend.id);
									callback(null, friend);
								}
							}, function(err, friends){
								console.log('friends:', friends.length);

								me.friends = friends;
								me.save();
								console.log('saved me');
							});
							
							
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