var fs = require('fs');

module.exports = function(app){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        
        
        console.log('adding route ' + file);
        
        require('./' + file)(app);
    });
}