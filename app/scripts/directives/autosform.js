'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:autosForm
 * @description
 * # autosForm
 */
angular.module('sisdrApp')
    .directive('autosForm', function(formData, $mdDialog, symbologies, RestApi, GISHelper, $compile, $rootScope, settings) {
        return {
            templateUrl: 'views/partials/autosform.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                // data, estado, num_auto
                scope.estados = formData.estados;
                scope.estados.push({
                    nome: 'Todos',
                    regiao: null,
                    sigla: null,
                    codigo: null
                })

                scope.changeStartDateHandler = function(value) {
                    var dateInput = $('#auto_end_date');
                    var period = GISHelper.calculatePeriod(value);
                    if (period) {
                        dateInput.datepicker('setStartDate', GISHelper.formatDate(period[0], '/'));
                        dateInput.datepicker('setEndDate', GISHelper.formatDate(period[1], '/'));
                    }
                };
            },
            controller: function($scope) {

                function AutosApi(start_date, end_date, estado, codigoAuto) {

                    $scope.InfractionsList = $scope.alertAutos = false;
                    $scope.AutosLoad = true;

                    var layer,
                        layerName,
                        state;

                    layerName = "Autos: " + (codigoAuto ? (codigoAuto + '-') : '') +
                        ((estado && estado.sigla) ? (estado.sigla + ' - ') : ' ') +
                        start_date + ' - ' + end_date;

                    !!(estado && estado.sigla) ? (state = estado.codigo) : (state = '');

                    end_date = GISHelper.formatDate(end_date);
                    start_date = GISHelper.formatDate(start_date);

                    var response = RestApi.getObject({
                        type: 'infractions-api',
                        model: 'infractions',
                        start: start_date,
                        end: end_date,
                        cod_uf: state,
                        num_auto_infracao: codigoAuto
                    });

                    response.$promise.then(success, error, loading);

                    function success(data) {

                        var infractions;

                        infractions = data.features;

                        if (infractions.length) {
                            var keys = GISHelper.csvReturn(infractions, 'latLng');

                            $scope.lastInfractionName = layerName;
                            $scope.layers[layerName] = L.geoJson(infractions, {
                                pointToLayer: infractionsToMarker,
                            });
                            $scope.csvInfractions = keys;
                            $scope.InfractionsLastData = infractions.map(GISHelper.formatData);
                            $scope.InfractionsList = true;
                            $scope.AutosLoad = false;
                            //Toggle Sidenav
                            $scope.toggleNav('filter');

                        } else {
                            error();
                        }
                    }

                    function error(data) {
                        $scope.AutosLoad = false;
                        $scope.alertAutos = true;
                    }

                    function loading(data) {
                        console.log(data);
                    }
                }

                function closeDialog() {
                    $mdDialog.hide();
                }

                function onComplete() {
                    $('tr').on('click', clickTable);
                    $scope.loadDialog = false;
                }

                function clickTable() {
                    var cell = $(this).data('geom');
                    if (cell) {
                        cell = [cell[1], cell[0]];
                        $scope.layers[$scope.lastInfractionName].addTo($scope.map);
                        $scope.map.setView(cell, 12);
                    } else {
                        alert('Linha Selecionada não possui geometria associada');
                    }
                }

                function showDialog(ev) {

                    $scope.loadDialog = true;

                    if ($scope.loadDialog) {
                        $mdDialog.show({
                            scope: $scope.$new(),
                            templateUrl: 'views/partials/infractionsDialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            onComplete: onComplete,
                            // onShowing: onShowing,
                            // clickOutsideToClose:true
                        });
                    }
                }

                var infractionsToMarker = $scope.infractionsToMarker;
                $scope.AutosApi = AutosApi;
                $scope.showInfractionsDialog = showDialog;
                $scope.closeInfractionsDialog = closeDialog;

            }
        };
    });