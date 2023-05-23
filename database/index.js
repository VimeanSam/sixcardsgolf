//Connect to Mongo database
const dbConfig = require('../config/config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//your local database url
//27017 is the default mongoDB port
const uri = process.env.MONGODB_URI || dbConfig.host+"/"+dbConfig.directory;

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then(
    () => { 
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ 
        console.log('Connected to Mongo');
        
    },
    err => {
         /** handle initial connection error */ 
         console.log('error connecting to Mongo: ');
         console.log(err);
        }
  );


module.exports = mongoose.connection;