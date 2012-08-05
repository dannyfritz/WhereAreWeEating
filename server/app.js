/*------------------------------------------------------------------------------
Copyright (c) 2012, Danny Fritz <dannyfritz@gmail.com>
Free Attribution License (FAL) 1.0
------------------------------------------------------------------------------*/

var application_root = __dirname
	, express = require("express")
	, path = require("path")
	, mongoose = require('mongoose')
	, port = process.argv[2] ? process.argv[2] : 8890;

console.log("port: ", port);

var app = express.createServer();

// Database

mongoose.connect('mongodb://localhost/WhereAreWeEatin');

var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
		title: {type: String, unique: true, trim: true, required: true}
	, categories: [String]
	, genres: [String]
	, latitude: {type: Number, min: -90, max: 90}
	, longitude: {type: Number, min: -180, max: 180}
	, timesVisited: [Date]
});

var Place = mongoose.model('Place', PlaceSchema);

// Config

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3030');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	next();
}

app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(allowCrossDomain);
	app.use(express.static(path.join(application_root, "../client")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// REST

app.post('/apiv1/place', function(req, res) {
	var place;

	console.log("POST: ");
	console.log(req.body);

	place = new Place({
			title: req.body.title
		, latitude: req.body.latitude
		,	longitude: req.body.longitude
	});

	place.save(function(err) {
		if (!err) {
			return console.log("Place created.");
		} else {
			return console.log(err);
		}
	});

	return res.send(place);
})

app.get('/apiv1/place', function (req, res) {
	console.log("GET: ");
	console.log(req.body);
	return Place.find(function (err, places) {
		if (!err) {
			return res.send(places);
		} else {
			return console.log(err);
		}
	});
});

app.get('/apiv1/place/:title', function (req, res) {
	console.log("GET: ");
	console.log(req.body);
	var searchFields = {
		title: req.params.title
	}
	return Place.findOne(searchFields, function (err, place) {
		if (!err) {
			return res.send(place);
		} else {
			return console.log(err);
		}
	});
});

app.delete('/apiv1/place/:title', function (req, res) {
	console.log("DELETE: ");
	console.log(req.params.title);
	var searchFields = {
		title: req.params.title
	}
	return Place.findOne(searchFields, function (err, place) {
		if (!err) {
			place.remove();
			return res.send(place);
		} else {
			return console.log(err);
		}
	});
});

app.post('/apiv1/decide', function(req, res) {
	console.log("POST: ");
	console.log(req.body);

	Place.count({}, function(err, count) {
		var callback = function(err, places) {
			if (!err) {
				var index = Math.floor(Math.random() * count);
				var place = places[index]
				return res.send(place);
			} else {
				return console.log(err);
			}
		};
		Place.find({}, callback)
	});

})

app.get('/apiversions', function (req, res) {
	res.send('API\'s available:\napiv1');
});

// Launch server

app.listen(port);