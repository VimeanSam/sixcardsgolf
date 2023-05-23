const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
mongoose.promise = Promise;

// Define userSchema
const userSchema = new Schema({
	username: { type: String, unique: true, required: true },
	email: { type: String, unique: false, required: true },
	password: { type: String, unique: false, required: true },
	avatar: String,
	wins: {type: Number, default: 0},
	totalPoints: {type: Number, default: 0},
	gamesPlayed: {type: Number, default: 0}
});

// Define schema methods
userSchema.methods = {
	checkPassword: function (inputPassword) {
		return bcrypt.compareSync(inputPassword, this.password);
	},
	hashPassword: plainTextPassword => {
		return bcrypt.hashSync(plainTextPassword, saltRounds);
	}
}

userSchema.pre('save', function (next) {
	if (!this.password) {
		next();
	} else {
		console.log('HashPassword');	
		this.password = this.hashPassword(this.password);
		next();
	}
})

const User = mongoose.model('User', userSchema);
module.exports = User;