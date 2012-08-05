/*------------------------------------------------------------------------------
Copyright (c) 2012, Danny Fritz <dannyfritz@gmail.com>
Free Attribution License (FAL) 1.0
------------------------------------------------------------------------------*/

var map = {};

(function() {
	'use strict';

	var mapObject
		, infoWindow
		, markersArray = []
		, chicagoOfficeLatLng = new google.maps.LatLng(41.88062, -87.63989);

	var mapOptions = {
		center: chicagoOfficeLatLng,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scrollwheel: false,
		disableDoubleClickZoom: true,
		keyboardShortcuts: false
	};

	mapObject = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	infoWindow = new google.maps.InfoWindow();

	var origin = new google.maps.Marker({
		map: mapObject,
		position: chicagoOfficeLatLng,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 8,
			strokeColor: '#00f',
		},
		clickable: false,
		title: 'You are here.'
	});

	function refresh() {
		google.maps.event.trigger(mapObject, 'resize');
	}

	function reset() {
		deleteOverlays();
		google.maps.event.trigger(mapObject, 'resize');
	}

	function newMarker(location) {
		var marker = new google.maps.Marker({
			position: location,
			map: mapObject
		});
		markersArray.push(marker);
		return marker;
	}

	function clearOverlays() {
		if (markersArray) {
			for (var i in markersArray) {
				markersArray[i].setMap(null);
			}
		}
	}

	function showOverlays() {
		if (markersArray) {
			for (var i in markersArray) {
				markersArray[i].setMap(mapObject);
			}
		}
	}

	function deleteOverlays() {
		if (markersArray) {
			for (var i in markersArray) {
				markersArray[i].setMap(null);
			}
			markersArray.length = 0;
		}
	}

	function search(query, types, markerCallback) {
		var service = new google.maps.places.PlacesService(mapObject);
		var request = {
			location: chicagoOfficeLatLng,//mapObject.getCenter(),
			keyword: query || '',
			types: types || ['food'],
			rankBy: google.maps.places.RankBy.DISTANCE
		};

		var searchCallback = function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				var callback = markerCallback ? markerCallback : createMarker
				for (var i in results) {
					var place = results[i];
					callback(place)
				}
			}
		}

		service.search(request, searchCallback);
	}

	function createMarker(place) {
		var marker = newMarker(place.geometry.location)

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent(place.name);
			infoWindow.open(mapObject, this);
		});
	}

	map.infoWindow = infoWindow;
	map.reset = reset;
	map.refresh = refresh;
	map.search = search;
	map.newMarker = newMarker;
	map.mapObject = mapObject;
	map.origin = chicagoOfficeLatLng;
}());
