var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser')
var urlutils = require('url');
var cookieParser = require('cookie-parser');
var config = require('./configs/config');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));



var pool = mysql.createPool(config);
var crud = require('./crud')(pool, config);

var session = require('cookie-session');
app.use(session({keys: ['secret']}));

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(id, done) {
	done(null, {username: id});
});

var auth = passport.authenticate(
	'local', {
		successRedirect: '/', 
		failureRedirect: '/login'
	}
);

var userController = require('./controllers/userController.js')(auth, pool, __dirname);

passport.use(new LocalStrategy(userController.strategy));

var mustBeAuthenticated = function (req, res, next) {
	req.isAuthenticated() ? next() : res.redirect('/');
};


app.all('/api', mustBeAuthenticated);
app.all('/db', mustBeAuthenticated);
app.all('/terminal', mustBeAuthenticated);
app.use('/api', crud);


app.get('/dishes', function(req, res){
	pool.query("select dishes.id, dishes.name, dishes.price, dishes.weight, category.name as category from dishes, category where dishes.id_category = category.id;", function(err, rows){
		res.send(rows);
	});
})


app.get('/order-id', function(req, res){
	pool.query("SHOW TABLE STATUS FROM `rest` LIKE 'orders'", function(err, rows){
		res.send(rows[0]);
	});
});


app.get('/menu', function(req, res){
	res.sendFile( __dirname + "/public/" + "menu.html" );
})

app.get('/', userController.root);

app.get('/terminal', userController.terminal_get);
app.get('/db', userController.db_get);

app.get('/logout', userController.logout);
app.get("/login", userController.login_get);
app.post("/login", userController.login_post);

app.use(function(req, res, next) {
  res.status(404).send('404 Not Found');
});

app.listen(3000, function () {
	console.log('listen on 3000');
});



