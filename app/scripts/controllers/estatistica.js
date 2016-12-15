'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:estatisticaCtrl
 * @description
 * # estatisticaCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('estatisticaCtrl', function($scope, $rootScope, $q, RestApi, formData, $location) {

        /**
         * Resultado da requisição
         * @param data
         */
        function onResult(result) {
            $scope.estatisticas = result.estatistica;
            $scope.projetos = $scope.estatisticas.projeto;
            $scope.propriedades = $scope.estatisticas.propriedades_lindeiras;

            var dado_pie3D = [];
            var dado_propriedade = [];

            for(var i = 0; i < $scope.projetos.length; i++ ){
            	dado_pie3D.push([$scope.projetos[i]['uf'], $scope.projetos[i]['qtd_projetos']])
            }

            for(var i = 0; i <  $scope.propriedades.length; i++ ){
            	dado_propriedade.push([$scope.propriedades[i]['uf'], $scope.propriedades[i]['qtd_propriedades']])
            }

            Highcharts.chart('pie3DProjetos', {
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45
                    }
                },
                title: {
                    text: 'Quantidade de Projetos por estados'
                },
                subtitle: {
                    text: 'Total de Projetos: ' + $scope.estatisticas.total[0]['total_projetos']
                },
                plotOptions: {
                    pie: {
                        innerSize: 100,
                        depth: 45
                    }
                },
                series: [{
                    name: 'Total',
                    data: dado_pie3D
                }]
            });

       	Highcharts.chart('pie3DPropriedades', {
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45
                    }
                },
                title: {
                    text: 'Quantidade de Propriedades Lindeiras por estados'
                },
                subtitle: {
                    text: 'Total de Projetos: ' + $scope.estatisticas.total[1]['total_propriedades']
                },
                plotOptions: {
                    pie: {
                        innerSize: 100,
                        depth: 45
                    }
                },
                series: [{
                    name: 'Total',
                    data: dado_propriedade
                }]
            });


        }

        function onError(error) {
            console.log(error.status);
        }

        var estatisticaRequest = RestApi.getObject({
            type: 'estatistica',
        });

        var promises = {
            estatistica: estatisticaRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);

    });