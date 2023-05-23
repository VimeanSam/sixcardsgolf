const express = require('express');
const app = express();
const morgan = require('morgan');
var bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('./database');
const passport = require('./passport');
const methodOverride = require('method-override');
const user = require('./routes/api.user/user');
const lobby = require('./routes/api.games/global/lobby');
const golf = require('./routes/api.games/golf/golf');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(
	session({
		secret: 'keyboard cat', 
		resave: false, 
		saveUninitialized: false 
	})
);

// app.use(express.json())
// app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());
app.use(passport.session());

//api
app.use('/api/user', user);
app.use('/api/lobby', lobby);
app.use('/api/game/golf', golf);

//deployment stuff
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/build/index.html"))
);


// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.resolve(__dirname, '/app','client', 'build')));
//     app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname, '/app', 'client', 'build', 'index.html'));
//     });
// }

module.exports = app;