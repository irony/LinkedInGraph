var fs = require('fs');

module.exports = function(app){

    app.get('/', function(req, res){
      res.redirect('/map');
    });

    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        
        
        console.log('adding route ' + file);
        
        require('./' + file)(app);
    });
}