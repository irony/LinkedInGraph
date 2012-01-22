

var mongoose = require('mongoose');

var Person = new mongoose.Schema({
  firstName  :  { type: String},
  lastName :  { type: String},
  headline   :  { type: String},
  company : {type: {}},
  id   :  { type: String, unique: true },
  industry  :   { type: String},
  friends : [Person]
});


module.exports = Person;

