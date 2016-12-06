'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:DupCtrl
 * @description
 * # DupCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('DupCtrl', function($scope, $rootScope, $q, RestApi, formData) {

        $scope.dups = [];
        $scope.brs = [];
        $scope.estados = formData.estados;
        $scope.showInputBR = false;
        $scope.showInputSegmento = false;
        $scope.uf_class = 'col-md-12';


        $scope.filterDup = function(filter) {
            var estado = filter.estado.sigla;

            if (filter.br && filter.br.br) {
                var br = filter.br.br;
                var sg_inicial = filter.seg_inicial;
                var sg_final = filter.seg_final;

                var filtros = {
                    'UF': estado,
                    'BR': br,
                    'KM_INICIO': sg_inicial,
                    'KM_FINAL': sg_final
                };
            } else {
                var filtros = {
                    'UF': estado,
                };
            }

            console.log(filtros);

        };

        $scope.getBR = function(filter) {
            $scope.showInputBR = false;
            $scope.showInputSegmento = false;
            $scope.uf_class = 'col-md-12';

            var brRequest = RestApi.get({
                type: 'projetos-br',
                'state': filter.sigla
            });
            var promises = {
                brs: brRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResultBR, onError);
        };


        /**
         * Resultado da requisição
         * @param data
         */
        function onResult(result) {
            $scope.dups = result.dups;
            console.log($scope.dups);

        }

        function onResultBR(result) {
            if (result.brs.length) {
                $scope.brs = result.brs;
                $scope.showInputBR = true;
                $scope.showInputSegmento = true;
                $scope.uf_class = 'col-md-4';
            }

        }

        function onError(error) {
            console.log(error);
        }

        /* Send request for restAPI */
        var dupRequest = RestApi.get({
            type: 'dups-list'
        });
        //var brRequest = RestApi.get({type: 'projetos-br'});

        var promises = {
            dups: dupRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);

    });


angular.module('sisdrApp')
    .controller('DupDetailCtrl', function($scope, $rootScope, $q, RestApi, formData, $mdSidenav, $routeParams) {
    	
    	$scope.msg = false;

        $scope.openNav = function(navID){
            $mdSidenav(navID).toggle();
        };
        
        if (!$routeParams.id) {
        		$scope.msg = "Parâmetro inválido";
        }else {

            var id_dup = $routeParams.id;

            function onResult(result) {
                $scope.dup = result.dup;
                console.log($scope.dup);
                $scope.adicionarGeoJSON($scope.dup.geojson);
                $('#map').css('height', '420px');
            };

            function onError(error) {
                console.log(error);
                $scope.msg = "Não foi possivel consultar dados.";
            }

            /* Send request for restAPI */
            var dupRequest = RestApi.getDup({
                type: 'dups-detail',
                pk: id_dup
            });


            var promises = {
                dup: dupRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResult, onError);

            $scope.adicionarGeoJSON = function(geoString) {
                console.log($scope);
                var json = $.parseJSON(geoString);


                if (typeof json == 'object') {
                    var layer = L.geoJson(json, {
                        style: {
                            fillColor: '#FF0000',
                            weight: 2,
                            color: '#DC143C',
                        }
                    }).addTo($scope.map);

                    $scope.updateFitBounds(layer);
                    //$scope.map.setZoom(9);
                }
            };

            /**
             * Atualiza a área de visualização do mapa.
             * @param layer
             */
            $scope.updateFitBounds = function(layer) {
                var bounds, layers, updated = false;
                if ('getBounds' in layer) {
                    bounds = layer.getBounds();
                } else if ('getLayers' in layer) {
                    bounds = layer.getLayers()[0].getBounds();
                }
                if (bounds && Object.keys(bounds).length) {
                    $scope.map.fitBounds(bounds);
                    updated = true;
                }
                return updated;
            };

            debugger;

        };
    });