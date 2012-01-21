module.exports = function(app){

	app.get('/map', function(req, res){
        
        
        
        var neo4j = require('neo4j');
		var db = new neo4j.GraphDatabase('http://localhost:7474');
		
		function print(err, res) {
		    console.log(err || (res && res.self) || res);
		}
		
		// Create node
		var node = db.createNode({hello: 'world'});
		node.save(print);
		
		// Get node
		node = db.getNodeById(1, print);
		
		// Get relationship
		rel = db.getRelationshipById(1, print)
        
        
		res.render('map', {title: 'This is your connections', body : 'See your connections below'});
    
    });
}