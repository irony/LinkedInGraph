module.exports = function(app){


	// return a list of nodes and edges for the current user and his friends based on their company relationships
	app.get('/map.json', function(req, res){
        
        
      	var mongoose = require('mongoose');
		var db = mongoose.connect('mongodb://localhost/graphTest');
		
		var Person = mongoose.model('Person', require('../models/person.js'));
		
		var nodes = {};
		var edges = {};
		
		var fillNodes = function(person, depth, callback){
			if (depth < 1)
				return;
				
			var company = getCompanyName(person);
			if (!company)
				return; // people with no companies will be sorted away here
				
			if (!nodes[company]) nodes[company] = {};			
			if (!nodes[company].persons) nodes[company].persons = [];
			
			nodes[company].persons.push({name : person.firstName + ' ' + person.lastName, id:person.id, title : person.company ? person.company.title : null});
			
			if (person.friends.length > 0)
			{
				person.friends.forEach(function(friend){
					if (friend){
						// recurse fill friends of this person
						fillNodes(friend, depth-1);
						
						if (!edges[company]) edges[company] = [];
						
						var friendCompany = getCompanyName(friend);
						if (friendCompany && !edges[company].some(function(item){item == friendCompany}))
							edges[company].push(friendCompany);
					}
					
				});
				
			}
			
			if (callback)
				callback(person);

		};
		
		
		Person.findOne({id : req.query['id'] || app.currentUserId || 'X8O4G03QY3'}) // hardcoded id now to christian
				.populate('friends')
				.run(function(err, person){
					console.log('found person with full friends');
					if (person){
						// load the details and fill the node and edges variables for two levels of friends
						fillNodes(person, 2, function(){
							
							res.json({nodes: nodes, edges : edges});
						});
					} else {
						res.json({nodes: nodes, edges : edges});
					}

				});

    });
        
    var getCompanyName = function(person)
    {
		return person.company ? person.company.company.name.replace(' AB', '') : null;
    };
    
    app.get('/map', function(req, res){
    		res.render('map', {
				title : 'Your connections'
			});
    });
}