/*------------------------------------------------------------------------------
Copyright (c) 2012, Danny Fritz <dannyfritz@gmail.com>
Free Attribution License (FAL) 1.0
------------------------------------------------------------------------------*/

var waew = angular.module('waew', ['ngResource'])
	.factory('Place', function ($resource) {
		return $resource('apiv1/place/:title', {}, {
			getAll: {method:'GET', params:{}, isArray:true},
			add: {method:'POST', params:{}},
			remove: {method:'DELETE', params:{}}
		})
	})
	.factory('Decide', function ($resource) {
		return $resource('apiv1/decide', {}, {
			get: {method:'POST', params:{}}
		});
	});

function WAWECtrl ($scope, Place, Decide) {
	'use strict';
	$scope.places = Place.getAll();
	$scope.decision = null;

	$scope.makeDecision = function () {
		if ($scope.decision) {
			return;
		}
		Decide.get({}, {
			latitude: map.origin.lat(),
			longitude: map.origin.lng()
		}, function(data) {
			console.log("Decided on " + data.title)
			$scope.decision = data
			$('#decisionBtn').addClass('disabled')
		})
	}

	$scope.refreshPlaces = function () {
		$scope.places = Place.getAll();
	}

	$scope.PlaceToRecord = function (place) {
		var newRecord = {};
		newRecord.title = place.name + " (" + place.vicinity + ")";
		if (place.geometry) {
			newRecord.longitude = place.geometry.location.Ya;
			newRecord.latitude = place.geometry.location.Za;
		}
		newRecord.categories = place.types;
		return newRecord;
	}

	$scope.addPlace = function (place) {
		var place = place ? place : {name: $scope.placeName}
		var record = $scope.PlaceToRecord(place);
		Place.add({}, record, function () {
			$scope.places.push(record);
		});
	}

	$scope.removePlace = function (record) {
		Place.remove({title: record.title}, {}, function () {
			var index = $scope.places.indexOf(record);
			if (index != -1) {
				$scope.places.splice(index, 1);
			}
		})
	}

	$scope.searchPlace = function () {
		map.reset();
		map.search($scope.searchQuery, ['food'], $scope.createMarker);
	}

	$scope.createMarker = function (place) {
		var location = place.geometry.location
		var marker = new map.newMarker(location)

		google.maps.event.addListener(marker, 'click', function () {
			var addButton = $(
				"<button class='btn-primary btn-success'>" +
					"<i class='icon-plus icon-white'></i>" +
					"Add" +
				"</button>")
			addButton.click(function(e) {
				$scope.$apply(function() {
					$scope.addPlace(place);
				});
			});

			var content = $("<span></span>")
			content.append(addButton);
			content.append(" " + place.name);

			map.infoWindow.setContent(content[0]);
			map.infoWindow.open(map.mapObject, this);
		});
	}

};
