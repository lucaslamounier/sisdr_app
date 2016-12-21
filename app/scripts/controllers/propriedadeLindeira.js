'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:PropriedadesLindeirasCtrl
 * @description
 * # PropriedadesLindeirasCtrl
 * Controller of the sisdrApp
 */


angular.module('sisdrApp')
    .controller('PropriedadesLindeirasCtrl', function($scope, $rootScope, $q, RestApi, formData, $location, $route, $cookies, ACCESS_LEVEL, auth) {
        $scope.propriedadesLindeiras = [];
        $scope.estados = formData.estados;
        $scope.geoJsonLayer = {}
        $scope.loading = false;
        $scope.uf_class = 'col-md-2';

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
            $scope.propriedadesLindeiras = result.propLindeira.features;
            $scope.geoJSON = L.geoJson($scope.propriedadesLindeiras, {
                style: function(feature) {
                    return {
                        color: '#03f',
                        weight: 4,
                        fillColor: '#03f',
                    }
                },
                onEachFeature: function(feature, layer) {
                    var name = 'propriedade_' + feature.id;
                    $scope.geoJsonLayer[name] = layer;
                    var html = [
                        '<p><strong>',
                        "<a href=''>",
                        feature.properties.nm_propriedade,
                        '</a>',
                        '</strong>',
                        '</p>',
                        '<div class="btn-group btn-group-sm">',
                        '<div>',
                        '<p><strong>Municipio:</strong> ' + feature.properties.nm_municipio + '<br />',
                        '<strong>Proprietário:</strong>: ' + feature.properties.nm_proprietario + '<br />',
                        '<strong>BR:</strong> ' + feature.properties.profaixa.br + '<br />',
                        '<strong>UF:</strong>: ' + feature.properties.sg_uf + '</p>',
                        '</div>',
                        '</div>'
                    ].join('');
                    layer.bindPopup(html);
                }
            });
            $scope.geoJSON.addTo($scope.map);
            $scope.loading = false;
            updateFitBounds($scope.geoJSON);
        };

        /*End onResult*/

        function onError(error) {
            if (error.status === -1) {
                console.log('reload page..');
                window.location.reload();
            }else{
                $scope.msg = "Não foi possivel consultar dados.";
            } 
            console.log('Erro:' + error.statusText, error.status);
        }

        $scope.seeOnMap = function(id) {

            //id = $(id).attr('id');
            id = 'propriedade_' + id;
            if ($scope.lastSelectedLayer)
                $scope.lastSelectedLayer.setStyle({
                    color: '#03f',
                    weight: 3,
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

        $scope.loading = true;

        /* Send request for restAPI */
        var propLindeiraRequest = RestApi.getPropLindeira({
            type: 'propriedade-lindeira'
        });

        var promises = {
            propLindeira: propLindeiraRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);


        function onResultBR(result) {
            debugger;
            if (result.brs.length) {
                $scope.brs = result.brs;
                $scope.showInputBR = true;
                $scope.showInputSegmento = true;
                $scope.uf_class = 'col-md-4';
            }

        }

        $scope.getBR = function(filter) {
            $scope.showInputBR = false;
            $scope.showInputSegmento = false;
            $scope.uf_class = 'col-md-12';

            var brRequest = RestApi.getObject({
                type: 'propriedade-lindeira-br',
                'state': filter.sigla
            });
            var promises = {
                brs: brRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResultBR, onError);
        };


    });


angular.module('sisdrApp')
    .controller('PropriedadesLindeirasDetailCtrl', function($scope, $rootScope, $q, RestApi, formData, $location, $routeParams, $cookies, auth, ACCESS_LEVEL) {

        $scope.propriedadeLindeira = {};

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


        function onResult(result) {
            $scope.propriedadeLindeira = result.propriedade;
            $scope.adicionarGeoJSON($scope.propriedadeLindeira.geojson)
        };

        function onError(error) {
            if (error.status === -1) {
                console.log('reload page..');
                window.location.reload();
            }else{
                $scope.msg = "Não foi possivel consultar dados.";
            } 
            console.log('Erro:' + error.statusText, error.status);
        }
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

        if (!$routeParams.id) {
            $scope.msg = "Parâmetro inválido";

        } else {

            /* Send request for restAPI */
            var propLindeiraRequest = RestApi.getPropLindeiraDetail({
                type: 'propriedade-lindeira-c',
                id: $routeParams.id,
            });

            var promises = {
                propriedade: propLindeiraRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResult, onError);
        }
    });