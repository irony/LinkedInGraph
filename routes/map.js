module.exports = function(app){

	app.get('/map.json', function(req, res){
        
        
      	var mongoose = require('mongoose');
		var db = mongoose.connect('mongodb://localhost/graphTest');
		
		var Person = mongoose.model('Person', require('../models/person.js'));
		
		Person.find({id : req.query['id'] || app.currentUserId}, function(err, docs){
			var nodes = {};
			var edges = {};
			docs.forEach(function(person){
				var company = getCompanyName(person);
				if (!company)
					return; // people with no companies will be sorted away here
					
				if (!nodes[company]) nodes[company] = {};			
				if (!nodes[company].persons) nodes[company].persons = [];
				
				nodes[company].persons.push({name : person.firstName + ' ' + person.lastName, id:person.id, position : person.company ? person.company.position : null});
				
				if (person.friends.length > 0)
				{
					
					person.friends.forEach(function(friend){
						var friendCompany = getCompanyName(friend);
						if (!friendCompany) return;
						
						if (!nodes[friendCompany]) nodes[friendCompany] = {};
						if (!nodes[friendCompany].persons) nodes[friendCompany].persons = [];
						nodes[friendCompany].persons.push({name : friend.firstName + ' ' + friend.lastName, id:friend.id, title : friend.company ? friend.company.title : null});

						if (nodes[friendCompany].persons.length > 1){
							if (!edges[company]) edges[company] = [];
							edges[company].push(friendCompany);
						}
					});
				}
				
			});
			
			
			
			res.json({nodes: nodes, edges : edges});
		});

    });
        
    var getCompanyName = function(person)
    {
    	return person.company ? person.company.company.name.replace(' AB', '') : null; 
    }
    
    app.get('/map', function(req, res){
    		res.render('map', {
				title : 'Your connections'
			});
    });
}