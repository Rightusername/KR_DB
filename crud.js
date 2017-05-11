var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var urlutils = require('url');

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   NEXT();
// });
// define the home page route
module.exports = function(pool, config){
	router.get('/getSchemaDB', (req, res)=>{
		pool.query("SHOW TABLES", function (error, rows, fields) {
			if(!!error){
				console.log("Error in the query" + "getSchemaDB");
			}else{
				var ar = [];
				for( var i=0; i<rows.length; i++){
					for(j in rows[i]){
						ar.push(rows[i][j]);
					}
				}
				res.json(ar);
			}
		});
	});

	router.post("/delRow",function (req, res) {
		console.log(req.body.table);
		console.log(req.body.id);
		pool.query("DELETE FROM "+req.body.table+" WHERE `id`='"+req.body.id +"'", function (error, rows, fields) {
			if(!!error){
				console.log("Error in the query" + "delRow");
				res.send("Error in the query");
			}else{
				console.log('Row deleted');
				res.send("succsesss");
			}
		});
	});


	router.post('/addRow',function (req, res) {
		console.log(req.body);
		var s = "INSERT INTO "+req.body.table +" (";
		var names = [];
		var values = [];
		for(var i in req.body){
			if(i!="table") {
				names.push(i);
				values.push('"' + req.body[i] + '"');
			}
		}

		for (var i = 0; i < names.length; i++) {
			s+=names[i];
			if(i!=names.length-1){
				s+=',';
			}

		}
		console.log(names, values);
		s+=") VALUES(";
		for (var i = 0; i < values.length; i++) {
			s+=values[i];
			if(i!=values.length-1){
				s+=',';
			}
		}
		s+=")";

		pool.query(s, function (error, rows, fields) {
			console.log(s);
			if(!!error){
				console.log("Error in the query" + "addRow");
				res.send("Error in the query");
			}else{
				console.log('Row added');
				res.send("succsesss");
			}
		});
	});

	router.post("/updateRow?",function (req, res) {
		updateRow(JSON.parse(req.body.json),req.body.id,req.body.table);
		console.log(JSON.parse(req.body.json));
		console.log(req.body.id, req.body.table);
		res.end();
	});

	function updateRow(obj,id,table) {
		var s = "UPDATE "+table+" SET ";
		var count=0;
		var j=0;
		for(var i in obj){
			count++;
		}
		for(var i in obj){
			j++;
			s += i + "=";
			s += '"' + obj[i] + '"';
			if (j != count) {
				s += ', '
			}
		}
		s+=' WHERE id="'+ id+'";';
		pool.query(s, function (error, rows, fields) {
			console.log(s);
			if(!!error){
				console.log("Error in the query" + "updateRow");
			}else{
				console.log('row updated');
			} 
		});
	}

	router.get('/getSchemaTable',function (req, res) {
		var table = urlutils.parse(req.url,true).query.table;

		pool.query('SHOW COLUMNS FROM '+ table +' FROM '+ config.database+';', function (error, rows, fields) {
			if(error){
				console.log("Error in the query" + " getSchemaTable " + table);
			}else{
				res.send(JSON.stringify(rows));
			}
		});
	});

	router.get('/getTable', function (req, res) {
		var table = urlutils.parse(req.url,true).query.table;
		pool.query('SELECT * FROM '+table, function (error, rows, fields) {
			if(!!error){
				console.log("Error in the query" + "getTable");
			}else{
				res.send(JSON.stringify(rows));
			}
		});
	});
	return router;
}