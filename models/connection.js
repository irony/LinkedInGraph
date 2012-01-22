
var mongoose = require('mongoose'), Schema = mongoose.Schema;

var Person = require('./person.js');

var Connection = new mongoose.Schema({
	from	:  { type: Schema.ObjectId, ref: 'Person' },
	to		:  { type: Schema.ObjectId, ref: 'Person' }
});


module.exports = Connection;