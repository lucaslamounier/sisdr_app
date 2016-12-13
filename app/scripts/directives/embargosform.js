'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:embargosForm
 * @description
 * # embargosForm
 */
angular.module('sisdrApp')
    .directive('embargosForm', function(RestApi, symbologies, GISHelper, $mdDialog, settings, $q) {
        return {
            templateUrl: 'views/partials/embargosform.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                scope.changeStartDateHandler = function(value) {
                    var dateInput = $('#emb_end_date');
                    var period = GISHelper.calculatePeriod(value);
                    if (period) {
                        dateInput.datepicker('setStartDate', GISHelper.formatDate(period[0], '/'));
                        dateInput.datepicker('setEndDate', GISHelper.formatDate(period[1], '/'));
                    }
                };

            },
            controller: function($scope) {

                /**
                Function that binds elements from form on embargosform.html
                @params start_date, end_date
                */
                function EmbargosApi(start_date, end_date) {

                    $scope.EmbargosList = $scope.alertEmbargos = false;
                    $scope.EmbargosLoad = true;

                    start_date = GISHelper.formatDate(start_date);
                    end_date = GISHelper.formatDate(end_date);

                    var layer,
                        layerName = 'Embargos: ' + start_date + ' - ' + end_date;

                    var response = RestApi.getObject({
                        type: 'banning-api',
                        model: 'banning',
                        start: start_date,
                        end: end_date
                    });

                    var responseCentroid = RestApi.getObject({
                        type: 'banning-api',
                        model: 'banning',
                        centroid: true,
                        start: start_date,
                        end: end_date
                    })

                    var embargosFeature = function(feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        }
                    }

                    var embargosToMaker = function(feature, latlng) {
                        var marker;
                        marker = symbologies.make(latlng, 'embargos-search');
                        marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        return marker;
                    }

                    $q.all({
                        embargos: response.$promise,
                        embargosCentroid: responseCentroid.$promise
                    }).then(success, error)

                    /**
                    Function success to show layer on map,
                    manipulate data to show on table,
                    @params self->data
                    */
                    function success(data) {

                        var csvTitle = ['#'],
                            csvKeys = [],
                            embargosCentroid,
                            embargos;

                        embargos = data.embargos;
                        embargosCentroid = data.embargosCentroid;

                        if (embargos.features.length) {
                            $scope.lastEmbargosName = layerName;
                            embargos.features = embargos.features.concat(embargosCentroid.features);
                            $scope.layers[layerName] = L.geoJson(embargos, {
                                onEachFeature: embargosFeature,
                                pointToLayer: embargosToMaker,
                                style: GISHelper.embargoSearchStyle
                            });

                            var keys = GISHelper.csvReturn(embargos.features, 'latLng', true);
                            keys.keys.pop();
                            keys.titles.pop();

                            $scope.csvEmbargos = keys;
                            $scope.EmbargosLastData = embargos.features.map(GISHelper.embargosFormatData);

                            $scope.EmbargosList = true;
                            $scope.EmbargosLoad = false;
                            $scope.toggleNav('filter');
                        } else {
                            $scope.EmbargosList = $scope.alertEmbargos = false;
                            $scope.EmbargosLoad = false;
                        }
                    }

                    /**
                    Function error to show msg if request return false;
                    @params self->data
                    */
                    function error(data) {
                        $scope.EmbargosList = $scope.alertEmbargos = false;
                        $scope.EmbargosLoad = false;
                    }
                }

                /**
                Function to closes Dialog opened with embargos data
                @params none
                */
                function closeDialog() {
                    $mdDialog.hide();
                }

                /**
                Function to compile click on each row from table
                That functions refers to clickTable, bound map
                @params none
                */
                function onComplete() {
                    $('tr').on('click', clickTable);
                    $scope.loadDialog = false;
                }

                /**
                Function to bound map on feature selected on row click
                @params none
                */
                function clickTable() {
                    var cell = $(this).data('geom');
                    if (cell) {
                        $scope.layers[$scope.lastEmbargosName].addTo($scope.map);
                        $scope.map.fitBounds(invertBounds(L.multiPolygon(cell).getBounds()));
                    } else {
                        alert('Linha Selecionada não possui geometria associada');
                    }
                }

                /**
                Function to invert LatLngBounds passed as arg
                Return an object and invert each lat e lng bounds
                @params latlngBounds
                */
                function invertBounds(latlngBounds) {
                    var latN, lngN, latS, lngS;
                    latN = latlngBounds._northEast.lat;
                    lngN = latlngBounds._northEast.lng;
                    latS = latlngBounds._southWest.lat;
                    lngS = latlngBounds._southWest.lng;

                    latlngBounds._northEast.lat = lngN;
                    latlngBounds._northEast.lng = latN;
                    latlngBounds._southWest.lat = lngS;
                    latlngBounds._southWest.lng = latS;
                    return latlngBounds
                }

                /**
                Function open Dialog opened with embargos data
                That function call embargosDialog.html
                @params none
                */
                function showDialog(ev) {
                    $scope.loadEmbargoDialog = true;

                    if ($scope.loadEmbargoDialog) {
                        $mdDialog.show({
                            scope: $scope.$new(),
                            templateUrl: 'views/partials/embargosDialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            onComplete: onComplete,
                            // onShowing: onShowing,
                            // clickOutsideToClose:true
                        });
                    }
                }



                $scope.EmbargosApi = EmbargosApi;
                $scope.closeEmbargosDialog = closeDialog;
                $scope.showEmbargosDialog = showDialog;
            }
        };
    });