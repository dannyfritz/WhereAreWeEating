/*------------------------------------------------------------------------------
Copyright (c) 2012, Danny Fritz <dannyfritz@gmail.com>
Free Attribution License (FAL) 1.0
------------------------------------------------------------------------------*/

var util = require("util")
	, application_root = __dirname
	, express = require("express")
	, path = require("path")
	, mongoose = require('mongoose')
	, port = process.argv[2] ? process.argv[2] : 8890;

// Mongoose
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

// Express
var app = express();
app.configure(function () {
	app.use(function(req, res, next) {
		console.log('%s %s', req.method, req.url);
		next();
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// REST
app.post('/:base/api/place', function(req, res) {
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
app.get('/:base/api/place', function (req, res) {
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
app.get('/:base/api/place/:title', function (req, res) {
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
app.delete('/:base/api/place/:title', function (req, res) {
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
app.post('/:base/api/decide', function(req, res) {
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

// Launch server
app.listen(port);
