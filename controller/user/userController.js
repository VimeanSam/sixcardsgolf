const mongoose = require('mongoose');
const dbConfig = require('../../config/config');
const mongoURI = process.env.MONGODB_URI || dbConfig.host+"/"+dbConfig.directory;
const conn = mongoose.createConnection(mongoURI);
const User = require('../../models/user');
const passport = require('../../passport');
const validator = require('../../utils/validation');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const ObjectID = mongoose.Types.ObjectId

module.exports.get = (req, res) => {
//   console.log("GET USER", req.user)
  if(req.user){
      res.status(200).json({user: req.user});
  }else{
      res.status(404).json({user: null});
  }
}

module.exports.signup = async (req, res) => {
    try{
        console.log('user signup');
        const {username, email, password, avatar} = req.body;
        // ADD VALIDATION
        const user = await User.findOne({$or: [{username: username}, {email: email}]})
        if(user || username.trim() === "server"){
            res.status(500).json({
                error: `${username} or ${email} is already taken..`,
            });
        }
        if(!user){
            let checkEmail = validator.validateEmail(email);
                let checkPassword = validator.validatePassword(password);
                if(checkEmail && checkPassword === ''){
                    const newPlayer = new User({
                        username: username,
                        email: email,
                        password: password,
                        avatar: avatar
                    });
                    const savedPlayer = await newPlayer.save();
                    res.status(200).json(savedPlayer);
                }else{
                    if(!checkEmail && checkPassword === ''){
                        res.status(500).json({
                            error: 'email is invalid. Please try again.',
                        });
                    }else if(checkEmail && checkPassword !== ''){
                        res.status(500).json({
                            error: checkPassword,
                        });
                    }else{
                        res.status(500).json({
                            error: 'email and password are invalid. Please try again.',
                        });
                    }
                }
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.forgot = async (req, res) => {
    try{
        const {password, _id} = req.body;
        if(!password || !_id){
            res.status(500).json({error: "DATA"});
        }else{
            const user = await User.findOne({_id: new ObjectID(_id)})
            if(user){
                let checkPassword = validator.validatePassword(password);
                if(checkPassword === ''){
                    let target = {_id: new ObjectID(_id)};
                    let updater = {password: bcrypt.hashSync(password, saltRounds)}
                    await User.updateOne(target, updater).exec();
                    res.status(200).json("ok");
                }else{
                    res.status(500).json({
                        error: checkPassword,
                    });
                }
            }else{
                res.status(500).json({error: "Invalid user ID"});
            }
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.update = async (req, res) => {
    try{
        const {username, password, avatar, _id} = req.body;
        // ADD VALIDATION
        let u_name = ""
        if(username){
            u_name = username
        }
        const user = await User.findOne({username: u_name})
        
        if (user || u_name.trim() === "server") {
            res.status(500).json({
                error: `${u_name} is already taken..`,
            });
        }else {
            let target = {_id: new ObjectID(_id)};
            let updater = {}
            if(username){
                updater.username = username
            }
            if(avatar !== undefined){
                updater.avatar = avatar
            }
            if(password){
                let checkPassword = validator.validatePassword(password);
                if(checkPassword === ''){
                    updater.password = bcrypt.hashSync(password, saltRounds);
                }else{
                    console.log(checkPassword);
                    return res.status(500).json({
                        error: checkPassword,
                    });
                }
            }
            // console.log("_ID", _id)
            // console.log("UNAME", username)
            // console.log("AVATAR", avatar)
            // console.log("PSWORD", password)
            // console.log("UPDATER", updater)
            await User.updateOne(target, updater).exec();
            res.status(200).json("ok");
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) =>{
        if(err){
            return next(err);
        }
        if(!user){
            console.log('user does not exist');
            return res.status(500).json('user does not exist')
        }
        req.login(user, (err) =>{
          if(err){
              return next(err);
          }
          res.status(200).json(user);
      })
    })(req, res, next);
}

module.exports.logout = function (req, res) {
    try{
        if (req.user) {
            console.log('logged out: '+req.user.username)
            req.logout((err)=>{
                if(err){return res.status(500).json(err);}
                req.user = null;
                req.session.destroy();
                res.status(200).json('ok');
            });
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}