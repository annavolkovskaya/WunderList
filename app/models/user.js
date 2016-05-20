var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://pekert:123@ds011442.mlab.com:11442/wunderlist');
var sha1 = require('sha1');
var userSchema = new mongoose.Schema({
    email:  String,
    password:   String,
    lists: [{title: String,
            tasks: [{title: String,
                    status: {type: Boolean, default: false},
                    date: {type: Date, default: new Date()},
                    subtask: [{title: String,
                                status: Boolean}]}]}]
});

userSchema.pre('save', function(next) {
	if (this.isNew){
        this.password = sha1(this.password);
    }
    next();
});

userSchema.methods = {
	coding: function(plainText) {
		return sha1(plainText) === this.password;
	}
};

module.exports = db.model('user', userSchema);
