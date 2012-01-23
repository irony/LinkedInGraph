

var mongoose = require('mongoose');

var Person = new mongoose.Schema({
  firstName  :  { type: String},
  lastName :  { type: String},
  headline   :  { type: String},
  company : {type: {}},
  positions : {type: {}},
  id   :  { type: String, unique: true },
  industry  :   { type: String},
  friends : [{ type: mongoose.Schema.ObjectId, ref: 'Person' }]
});

// magically picks out the latest current position and makes it the current company
Person.pre('save', function (next) {
  if (this.positions)
  	this.company = this.positions.values.filter(function(position){ return position.isCurrent}).pop();
  //console.log('setting company:', this);
								
  next();
});


module.exports = Person;

