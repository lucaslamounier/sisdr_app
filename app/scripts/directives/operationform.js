'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:operationform
 * @description
 * # operationform
 */
angular.module('sisdrApp')
    .directive('operationForm', function(RestApi, symbologies, GISHelper) {
        return {
            templateUrl: 'views/partials/operationForm.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                scope.querySearch = querySearch;

                scope.operationNameExists = function(operationName) {
                    return operationName ? scope.operationsData.find(findName) : false;

                    function findName(operation) {
                        return operation.nom_operacao === operationName;
                    }
                }

                scope.changeStartDateHandler = function(value) {
                    var dateInput = $('#op_end_date');
                    var period = GISHelper.calculatePeriod(value);
                    if (period) {
                        dateInput.datepicker('setStartDate', GISHelper.formatDate(period[0], '/'));
                        dateInput.datepicker('setEndDate', GISHelper.formatDate(period[1], '/'));
                    }
                };

                var namesRest = RestApi.get({
                    type: 'operations-api',
                    model: 'operation-names'
                });
                namesRest.$promise.then(resultHandler, faultHandler)

                function resultHandler(data) {
                    scope.operationsData = data;
                }

                function faultHandler(error) {
                    console.log(error)
                }

                function querySearch(query) {
                    var results = query ? scope.operationsData.filter(filterQuery(query)) : [];
                    return results;
                }

                function filterQuery(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filterFn(operation) {
                        return (operation.nom_operacao.toLowerCase().indexOf(lowercaseQuery) === 0);
                    };
                }
            },

            controller: function($scope) {

                $scope.OperationsApi = function(searchText, start_date, end_date) {
                    var restData;
                    var layerName;
                    $scope.operationsLoad = true;
                    if (searchText) {
                        layerName = 'Operação: ' + searchText;
                        restData = RestApi.getObject({
                            type: 'operations-api',
                            model: 'operation',
                            start: searchText
                        });
                        restData.$promise.then(resultHandler, faultHandler);
                    } else if (start_date && end_date) {
                        layerName = 'Operações: ' + start_date + ' - ' + end_date;
                        restData = RestApi.get({
                            type: 'operations-api',
                            model: 'operations',
                            start: start_date,
                            end: end_date
                        });
                        restData.$promise.then(resultHandler, faultHandler);
                    }

                    function resultHandler(data) {
                        var layer = L.geoJson(data, {
                            onEachFeature: eachLayer
                        });
                        $scope.layers[layerName] = layer;
                        $scope.operationsLoad = false;
                        $scope.toggleNav('filter');
                    }

                    function faultHandler(data) {
                        $scope.operationsLoad = false;
                    }

                    function eachLayer(feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        }
                    }
                }
            }
        };
    });
