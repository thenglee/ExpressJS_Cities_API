var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var urlencode = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

// Redis connection
var redis = require('redis');

if (process.env.REDISTOGO_URL){
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var client = redis.createClient(rtg.port, rtg.hostname);
	client.auth(rtg.auth.split(":")[1]);
}else{
	var client = redis.createClient();
	client.select((process.env.NODE_ENV || 'development').length);
}

// End Redis connection

// client.hset('cities', 'Lotopia', 'description');
// client.hset('cities', 'Caspiana', 'description');
// client.hset('cities', 'Indigo', 'description');


app.get('/cities', function(req, res){
	client.hkeys('cities', function(err, names){
		if (err) throw err;
		res.json(names);
	});
	
});

app.post('/cities', urlencode, function(req, res){
	var newCity = req.body;
	client.hset('cities', newCity.name, newCity.description, function(err){
		if (err) throw err;
		res.status(201).json(newCity.name);
	});

	
});

app.delete('/cities/:name', function(req, res){
	client.hdel('cities', req.params.name, function(err){
		if (err) throw err;
		res.sendStatus(204);
	});
});

module.exports = app;


