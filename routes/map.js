module.exports = function(app){

	app.get('/map', function(req, res){
        
        
        
		res.render('map', {title: 'This is your connections', body : 'See your connections below'});
    
    });
}