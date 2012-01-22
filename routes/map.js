module.exports = function(app){

	app.get('/map.json', function(req, res){
        
        
      	var mongoose = require('mongoose');
		var db = mongoose.connect('mongodb://localhost/graphTest');
		
		var Person = mongoose.model('Person', require('../models/person.js'));
		var nodes = {};
		var edges = {};
		
		var fillPerson = function(person, depth){
			if (depth < 1)
				return;
				
			var company = getCompanyName(person);
			if (!company)
				return; // people with no companies will be sorted away here
				
			if (!nodes[company]) nodes[company] = {};			
			if (!nodes[company].persons) nodes[company].persons = [];
			
			nodes[company].persons.push({name : person.firstName + ' ' + person.lastName, id:person.id, position : person.company ? person.company.position : null});
			
			if (person.friends.length > 0)
			{
				
				person.friends.forEach(function(friend){
					fillPerson(friend, depth-1);
					if (!edges[company]) edges[company] = [];
					edges[company].push(getCompanyName(friend));
					
				});
			}

		}		
		
		
		Person.findOne({id : req.query['id'] || app.currentUserId}, function(err, person){
			
			if (person){
				// load the details and fill the node and edges variables		
				fillPerson(person, 2);
			}
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