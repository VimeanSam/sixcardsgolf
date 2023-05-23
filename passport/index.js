const passport = require('passport');
const LocalStrategy = require('./localStrategy');
const User = require('../models/user');
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId

// called on login, saves the id to session req.session.passport.user = {_id:'..'}
passport.serializeUser((user, done) => {
	done(null, { _id: user._id });
})

// user object attaches to the request as req.user
passport.deserializeUser(async (id, done) => {
	try{
		console.log('DeserializeUser called')
		const user = await User.findOne({_id: id}, 'username email avatar')
		if(user){
			done(null, user)
		}
	}catch (err){
		console.log(err)
	}
});

//  Use Strategies 
passport.use(LocalStrategy);

module.exports = passport;
