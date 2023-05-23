const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

const strategy = new LocalStrategy(
	{
		usernameField: 'username' // not necessary, DEFAULT
	},
	async function(username, password, done) {
		try{
			const user = await User.findOne({username: username})
			if (!user) {
				return done(null, false, { message: 'username not found!' })
			}
			if (!user.checkPassword(password)) {
				return done(null, false, { message: 'Incorrect password' })
			}
			return done(null, user)
		}catch(err){
			return done(err)
		}
	}
)

module.exports = strategy;
