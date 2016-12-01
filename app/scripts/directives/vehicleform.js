'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:vehicleForm
 * @description
 * # vehicleForm
 */
angular.module('sisdrApp')
    .directive('vehicleForm', function(RestApi, GISHelper, settings) {
        return {
            templateUrl: 'views/partials/vehicleForm.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

              /*  var rest = RestApi.get({
                    type: 'vehicles-api',
                    model: 'cars'
                });*/
                scope.geometryType = 'Pontos';
                /*rest.$promise.then(function(data) {
                    scope.viaturasData = data.map(mapData);
                    scope.viaturas = true;

                    function mapData(data) {
                        return {
                            name: data.plate,
                            value: data.id
                        }
                    }
                });*/

                scope.changeStartDateHandler = function(value) {
                    var dateInput = $('#vehi_end_date');
                    var period = GISHelper.calculatePeriod(value);
                    if (period) {
                        dateInput.datepicker('setStartDate', GISHelper.formatDate(period[0], '/'));
                        dateInput.datepicker('setEndDate', GISHelper.formatDate(period[1], '/'));
                    }
                };
            },

            controller: function($scope, $rootScope, symbologies, GISHelper) {

                var index = 0;

                function formatDate(date) {
                    date = date.split('/');
                    return date = date[2] + '-' + date[1] + '-' + date[0];
                }

                $scope.VehicleApi = function(Vehicle, start_date, end_date, geometryType) {

                    $scope.VehicleLoad = true;
                    $scope.alertVehicles = false;
/*

                    var restHeli = RestApi.routes({
                        type: 'vehicles-api',
                        car: Vehicle.value,
                        start_date: formatDate(start_date),
                        end_date: formatDate(end_date),
                    });
*/

                  /*  restHeli.$promise.then(function(data) {

                        var polylines, vehicles, layerName, polyline, traceHandler, layerGroup,
                            paths, polylineTrace, marker;

                        layerName = Vehicle.name + ': ' + start_date + '-' + end_date + ' : ' + geometryType;

                        if (data.features.length) {
                            if (geometryType === 'Pontos') {
                                vehicles = L.geoJson(data, {
                                    pointToLayer: pointToLayer
                                });

                                $scope.layers[layerName] = vehicles;
                            } else {
                                paths = [];
                                polylineTrace = L.polyline([]);

                                polyline = GISHelper.doMultiPolyline(data.features, getDate, getPoint, doPolyline)

                                traceHandler = GISHelper.traceRoute(polylineTrace, symbologies, 'vehicles-pos');
                                marker = traceHandler.marker;

                                layerGroup = L.layerGroup([polyline, marker]);

                                $scope.layers[layerName] = layerGroup;

                                marker.on('add', function() {
                                    traceHandler.start();
                                });

                                marker.on('remove', function() {
                                    traceHandler.stop();
                                });
                            }

                            $scope.alertVehicles = false;
                            $scope.toggleNav('filter');
                        } else {
                            $scope.alertVehicles = true;
                        }
                        $scope.VehicleLoad = false;

                        function getDate(feature) {
                            var date = new Date(feature.properties.date);
                            return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                        }

                        function getPoint(feature) {
                            var point = feature.geometry.coordinates.reverse();
                            polylineTrace.addLatLng(point);
                            return point;
                        }

                        function doPolyline(paths) {
                            return symbologies.make(paths, 'vehicles-multi-line');
                        }

                    });*/

                    function pointToLayer(feature, latlng) {
                        var marker;
                        marker = symbologies.make(latlng, 'vehicles-search');
                        // marker.options.fillColor = GISHelper.Palette.VEHICLES[index];
                        marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        return marker;
                    }
                }
            }
        };
    });
