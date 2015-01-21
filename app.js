var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
 
var app = express();
app.enable("jsonp callback");

var port = process.env.PORT || 1337;
var MongoClient = mongo.MongoClient;

var client = new MongoClient();

var db;

client.connect("mongodb://pinktastic:omuUUb2FiqJAvGJ@ds029811.mongolab.com:29811/pinktastic",function(err,db) {
    if(err) {
        console.log("Connection to database failed.");
    } else {
        categories = db.collection("categories");
        games = db.collection("games");
        console.log("Connection to database succeded.")
    }
});

//Include body-parser middleware to parse json body of requests
app.use(bodyParser.json());

//Cross origin (severside)
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


//GET
//Get a random category from the data set
app.get('/categories',function(req,res){
	console.log("getting a random category");
	var resultString = ""
	//use a for loop to run the below method three times to give three random category wors.
	var getCategories = function(documentCount, iteration, catArray) {
		if(iteration>0){
			var skipNum = Math.floor(Math.random()*(documentCount - 1));
			var options = {
				"limit": 1,
				"skip" : skipNum
			}
			categories.findOne({},{},options,function(err,doc){
				if(catArray.indexOf(doc)===-1) {
					catArray.push(doc);
					getCategories(documentCount, iteration-1, catArray);
				} else {
					getCategories(documentCount, iteration, catArray);
				}
			});
		} else {
			res.jsonp(catArray);
		}
		
	}
	categories.count(function(err,documentCount){
		getCategories(documentCount, 3, []);
	});
});
//Get a random game
app.get('/game/random',function(req,res) {
	games.count(function(err,documentCount) {
		var skipNum = Math.floor(Math.random()*(documentCount));
		var options = {
			'limit': 1,
			'skip': skipNum
		}
		games.findOne({},{},options,function(err,doc) {
			res.jsonp(doc);
		});
	});
});

//Get a game by id
app.get('/game/:id',function(req,res) {
    console.log("Getting game with ID:"+req.params.id);
    games.findOne({"_id":new ObjectId(req.params.id)},function(err,doc) {
        res.jsonp(doc);
    });
});

//POST
//Push a new game onto the server
app.post('/game',function(req,res) {
	var gameObj = req.body;
	gameObj.wins = 0;
	gameObj.losses = 0;
	games.save(gameObj,{w:1},function(err,result) {
		if(err) {
			res.send("FAIL");
		} else {
			res.jsonp(result);
		}
	})
});

//PATCH
//Increment wins/losses for a game
app.patch('/game/:id',function(req,res) {
	var id = ObjectId(req.params.id);
	var field = req.body.field;
	var incObject = {};
	incObject[field] = 1;
	var update = {};
	update['$inc'] = incObject;
	games.findAndModify(
		{_id:id},
		[],
		update,
		{upsert:true,safe:false},
		function(err,result) {
			res.jsonp(result);
		});
});

app.listen(port);
console.log("listening to" + port +"...");
