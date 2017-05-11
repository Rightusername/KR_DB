
var mysql = require('mysql');

module.exports = function(auth, pool, path){
	return {
		logout: function(req, res){
			req.logout();
			res.redirect('/');
		},

		settings: function(req, res){
			res.status(200).send('Secret place');
		},

		login_get:  function(req, res){
			res.sendFile(path + "/public/" + "login.html" );
		},
		login_post: function(req, res){
			if(!req.body.username){
				res.send({msg: "Enter your username"});
				return;
			}
			if(!req.body.password){
				res.send( {msg: "Enter your password"});
				return;
			}

			pool.query("SELECT * FROM employees WHERE username=" + mysql.escape(req.body.username), function(err, user){

				if( !user[0] ){
					res.send({ msg: "User is not exist" });
					return;
				}

				if(req.body.password ==  user[0].password) {
					auth(req, res);
				} else {
					res.send({ msg: "Wrong password" });
				}
			});
		},

		db_get: function(req, res){
			pool.query("SELECT * FROM employees WHERE username=" + mysql.escape(req.user.username), function(err, user){
				switch(user[0].position){
					case 1:
						res.redirect('/');
						break;
					case 2:
						res.sendFile( path + "/public/crud/" + "index.html" );
						break;
				}
			});
		},

		terminal_get : function(req, res){
			res.sendFile( path + "/public/terminal_/" + "index.html" );
		},

		root : function(req, res){
			if(req.isAuthenticated()){
				pool.query("SELECT * FROM employees WHERE username=" + mysql.escape(req.user.username), function(err, user){					
					switch(user[0].position){
						case 1:
							res.redirect('/terminal');
							break;
						case 2:
							res.redirect('/db');
							break;
					}
					
				});

			}else{
				res.redirect('/login');
			}
		},

		strategy: function(username, password, done){
			pool.query("SELECT * FROM employees WHERE username=" + mysql.escape(username), function(err, user){
				if(password == user[0].password){
					return done(null, {username: username});
				}
			});
		}
	}
}