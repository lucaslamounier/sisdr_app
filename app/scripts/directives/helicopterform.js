'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:helicopterForm
 * @description
 * # helicopterForm
 */
angular.module('sisdrApp')
    .directive('helicopterForm', function(RestApi, $q, GISHelper, settings) {
        return {
            templateUrl: 'views/partials/helicopterForm.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                var rest = RestApi.get({
                    type: 'helicopters-api',
                    model: 'helicopters'
                });
                scope.geometryType = 'Pontos';
                rest.$promise.then(function(data) {
                    scope.helicoptersData = data.map(mapData);
                    scope.helicopters = true;
                });

                function mapData(data) {
                    return {
                        name: data.nome,
                        value: data.nome.toLowerCase()
                    }
                }

                scope.changeStartDateHandler = function(value) {
                    var dateInput = $('#heli_end_date');
                    var period = GISHelper.calculatePeriod(value);
                    if (period) {
                        dateInput.datepicker('setStartDate', GISHelper.formatDate(period[0], '/'));
                        dateInput.datepicker('setEndDate', GISHelper.formatDate(period[1], '/'));
                    }
                };

                scope.regExDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
            },
            controller: function($scope, $rootScope, symbologies, GISHelper) {

                $scope.HelicopterApi = function(heli, start_date, end_date, geometryType) {

                    $scope.alert = false;
                    $scope.HelicopterLoad = true;

                    var restHeli = RestApi.routes({
                        type: 'helicopters-api',
                        nome: heli.name,
                        start_date: GISHelper.formatDate(start_date),
                        end_date: GISHelper.formatDate(end_date)
                    });

                    restHeli.$promise.then(function(data) {

                        var layerGroup, geometry, polyline, marker, traceHandler,
                            properties, date, geometryMap, day, paths,
                            polylineTrace;

                        var layerName = heli.name + ': ' + start_date + ' - ' + end_date + ' : ' + geometryType;

                        if (data.features.length) {

                            $scope.alertHelicopters = false;

                            if (geometryType === 'Pontos') {

                                layerGroup = L.geoJson(data, {
                                    pointToLayer: pointToLayer
                                });
                                $scope.layers[layerName] = layerGroup;

                            } else {
                                geometryMap = {};
                                polylineTrace = L.polyline([]);

                                data.features.map(function(feature) {
                                    return feature.geometry.coordinates.reverse();
                                });

                                polyline = GISHelper.doMultiPolyline(data.features, getDate, getPoint, doMultiPolyline);
                                traceHandler = GISHelper.traceRoute(polylineTrace, symbologies, 'helicopters-pos');

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

                            $scope.toggleNav('filter');

                        } else {
                            $scope.alertHelicopters = true;
                        }
                        $scope.HelicopterLoad = false;

                        function getDate(feature) {
                            var date = new Date(feature.properties.data_hora);
                            var day = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                            return day;
                        }

                        function getPoint(feature) {
                            polylineTrace.addLatLng(feature.geometry.coordinates);
                            return feature.geometry.coordinates;
                        }

                        function doMultiPolyline(paths) {
                            return symbologies.make(paths, 'helicopters-multi-line');
                        }

                    }, function(error) {
                        $scope.alertHelicopters = false;
                    });

                    function pointToLayer(feature, latlng) {
                        var marker;
                        marker = symbologies.make(latlng, 'helicopters-search');
                        marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        return marker;
                    }
                }
            }
        }
    });
