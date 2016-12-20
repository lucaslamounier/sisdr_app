'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:ProfaixaCtrl
 * @description
 * # ProfaixaCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('ProfaixaCtrl', function($scope, $rootScope, $q, RestApi, formData, $location, $cookies, auth, ACCESS_LEVEL) {
        $scope.geoJsonLayer = {};
        $scope.profaixas = [];

        if ($cookies.get('user_data')) {
            auth.setUser(ACCESS_LEVEL.USER, JSON.parse($cookies.get('user_data')));
            $rootScope.dataUser = {};
            $rootScope.dataUser.userName = auth.getUser();
        }

        $scope.$watch(auth.isAuthenticated, function(value, oldValue) {
            if (!value && oldValue) {
                console.info('User Disconnected');
                $location.path('#/');
            }

            var dataUser = {};

            if (value) {
                console.info('User Connected');
                auth.setUser(ACCESS_LEVEL.USER, JSON.parse($cookies.get('user_data')));
                dataUser.userName = auth.getUser();
                $rootScope.dataUser = dataUser;
            }
        }, true);

        auth.isAuthenticated() ? $rootScope.logged = true : $rootScope.logged = false;

        function onError(error) {
            if (error.status === -1) {
                console.log('reload page..');
                window.location.reload();
            }else{
                 $scope.msg = "Não foi possivel consultar dados.";
            } 
            console.log('Erro:' + error.statusText, error.status);
        };

        /**
         * Atualiza a área de visualização do mapa.
         * @param layer
         */
        function updateFitBounds(layer) {
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
        }


        function onResult(result) {
            $scope.profaixas = result.profaixas.features;
            $scope.geoJSON = L.geoJson($scope.profaixas, {
                style: function(feature) {
                    return {
                        color: '#03f',
                        weight: 4,
                        fillColor: '#03f',
                    }
                },
                onEachFeature: function(feature, layer) {
                    var name = 'profaixa_' + feature.id;
                    $scope.geoJsonLayer[name] = layer;
                    var html = [
                        '<p><strong>',
                        "<a href=''>",
                            feature.properties.vl_codigo_rodovia,
                        '</a>',
                        '</strong>',
                        '</p>',
                        '<div class="btn-group btn-group-sm">',
                        '<div>',
                        '<p><strong>BR:</strong> ' + feature.properties.vl_br + '<br />',
                        '<strong>Municipíos:</strong>: ' + feature.properties.li_municipio + '<br />',
                        '<strong>UF:</strong> ' + feature.properties.sg_uf + '<br />',
                        '<strong>Código rodovia:</strong> ' + feature.properties.vl_codigo_rodovia + '<br />',
                        '<strong>KM Inicial:</strong> ' + feature.properties.vl_km_inicial + '<br />',
                        '<strong>KM Final:</strong> ' + feature.properties.vl_km_final + '<br />',
                        '<strong>Tipo de Trecho:</strong>: ' + feature.properties.sg_tipo_trecho_display + '</p>',
                        '</div>',
                        '</div>'
                    ].join('');
                    layer.bindPopup(html);
                }
            });
            $scope.geoJSON.addTo($scope.map);
            updateFitBounds($scope.geoJSON);        
        };

        var profaixaRequest = RestApi.getObject({
            type: 'profaixa'
        });

        var promises = {
            profaixas: profaixaRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);

        $scope.seeOnMap = function(id) {
            id = 'profaixa_' + id;
            if ($scope.lastSelectedLayer)
                $scope.lastSelectedLayer.setStyle({
                    color: '#03f',
                    weight: 1,
                    fillColor: '#03f',
                });

            if ($scope.geoJsonLayer.hasOwnProperty(id) && $scope.geoJsonLayer[id]) {
                $scope.lastSelectedLayer = $scope.geoJsonLayer[id];
                $scope.geoJsonLayer[id].setStyle({
                    color: 'red',
                    weight: 3,
                    fillColor: 'red',
                });
                $scope.map.fitBounds($scope.geoJsonLayer[id].getBounds());
            }
        };

});

angular.module('sisdrApp')
    .controller('ProfaixaDetailCtrl', function($scope, $rootScope, $q, RestApi, $routeParams, $cookies, auth, $location, ACCESS_LEVEL) {

        $scope.msg = false;
        $scope.is_map = false;

        if ($cookies.get('user_data')) {
            auth.setUser(ACCESS_LEVEL.USER, JSON.parse($cookies.get('user_data')));
            $rootScope.dataUser = {};
            $rootScope.dataUser.userName = auth.getUser();
        }

        $scope.$watch(auth.isAuthenticated, function(value, oldValue) {
            if (!value && oldValue) {
                console.info('User Disconnected');
                $location.path('#/');
            }

            var dataUser = {};

            if (value) {
                console.info('User Connected');
                auth.setUser(ACCESS_LEVEL.USER, JSON.parse($cookies.get('user_data')));
                dataUser.userName = auth.getUser();
                $rootScope.dataUser = dataUser;
            }
        }, true);

        auth.isAuthenticated() ? $rootScope.logged = true : $rootScope.logged = false;


        $scope.adicionarGeoJSON = function(geoString) {
            var json = $.parseJSON(geoString);

            if (typeof json == 'object') {
                var layer = L.geoJson(json, {
                    style: {
                        fillColor: '#8B0000',
                        weight: 3,
                        color: '#FF0000',
                    }
                }).addTo($scope.map);

                $scope.updateFitBounds(layer);
                //$scope.map.setZoom(11);
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


        function onError(error) {
            if (error.status === -1) {
                   console.log('reload page..');
                    window.location.reload();
                }else{
                     $scope.msg = "Não foi possivel consultar dados.";
                } 
                console.log('Erro:' + error.statusText, error.status);
        };

        function onResult(result) {
                $scope.profaixa = result.profaixa;
                $scope.municipios_profaixa = '';
                $scope.adicionarGeoJSON($scope.profaixa.properties.geojson);
                for(var i = 0; i < $scope.profaixa.properties.li_municipio.length; i++){
                    $scope.municipios_profaixa +=  $scope.profaixa.properties.li_municipio[i];
                    if($scope.profaixa.properties.li_municipio[i+1]){
                        $scope.municipios_profaixa += ', ';
                    }
                };
            };



        if (!$routeParams.id) {
            $scope.msg = "Parâmetro inválido";
        } else {

            var id_profaixa = $routeParams.id;

            var profaixaRequest = RestApi.getProfaixaDetail({
                type: 'profaixa',
                id: id_profaixa
            });

            var promises = {
                profaixa: profaixaRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResult, onError);

    };

});

