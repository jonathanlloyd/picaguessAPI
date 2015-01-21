var express = require('express');
var router = express.Router();


//router.get('/', function(req, res){
	//res.render('index', {title: 'Express'});
//});

/* GET home page. */
/*router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});*/

//router.post('/', function(req, res){
//	console.log(req.query);
//});

router.get('/', function(req,res){
	console.log(req.params);
	res.send("Hello Express");
});
module.exports = router;
