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
        $scope.button_position = 'button-initial-25';

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

        $scope.filterPropLindeira = function(filter) {
            var estado = null,
                br = null,
                lote = null,
                filtros = {};

            if (!$scope.lastResults) {
                $scope.lastResults = $scope.propriedadesLindeiras;
            } else if (!$scope.propriedadesLindeiras.length && $scope.lastResults.length) {
                $scope.propriedadesLindeiras = $scope.lastResults;
            }

            /* Checa os filtros */
            if (filter && filter.estado && filter.estado.sigla) {
                estado = filter.estado.sigla;
                filtros['UF'] = estado;
            }

            if (filter && filter.br) {
                br = filter.br;
                filtros['BR'] = br;
            }

            if (filter && filter.lote && filter.lote.vl_lote) {
                lote = filter.vl_lote;
                filtros['lote'] = lote;
            }

            if (isEmpty(filtros)) {
                if (!$scope.propriedadesLindeiras.length && $scope.lastResults.length) {
                    $scope.propriedadesLindeiras = $scope.lastResults;
                } else if ($scope.propriedadesLindeiras.length !== $scope.lastResults.length) {
                    $scope.propriedadesLindeiras = $scope.lastResults;
                }
            } else if (estado && !br && !lote) {
                $scope.propriedadesLindeiras = $scope.lastResults.filter(function(prop) {
                    return (prop.properties.sg_uf === estado)
                })
            } else if (estado && br && !lote) {
                $scope.propriedadesLindeiras = $scope.lastResults.filter(function(prop) {
                    return (prop.properties.sg_uf === estado 
                            && prop.properties.profaixa.br === br)
                })
            } else if (estado && !br && lote) {
                $scope.propriedadesLindeiras = $scope.lastResults.filter(function(prop) {
                    return (prop.properties.sg_uf === estado 
                            && prop.properties.profaixa.lote == lote)
                })
            } else if (estado && br && lote) {
                $scope.propriedadesLindeiras = $scope.lastResults.filter(function(prop) {
                    return (prop.properties.sg_uf === estado 
                            && prop.properties.profaixa.br === br 
                            && prop.properties.profaixa.lote == lote)
                })
            } 
        };

        $scope.getLote = function(estado, BR) {
            var loteRequest, promises, allPromise;

            if (estado && estado.sigla && BR) {
                loteRequest = RestApi.get({
                    type: 'propriedade-lindeira-lote',
                    'state': estado.sigla,
                    'br': BR
                });

                promises = {
                    lotes: loteRequest.$promise,
                };

                allPromise = $q.all(promises);
                allPromise.then(onResultLote, onError);
            }
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
            $scope.loading = false;
            
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
            if (result.brs.length) {
                var brs = [];
                for(var i=0; i < result.brs.length; i++){
                    brs.push(result.brs[i].vl_br);
                }
                $scope.brs = brs;
                $scope.showInputBR = true;
            }
        };

        function onResultLote(result) {
            if (result.lotes.length) {
                $scope.lotes = result.lotes;
                $scope.showInputLote = true;
            }

        }

        $scope.cleanFilters = function() {
            $scope.filter = {};
            $scope.showInputBR = false;
            $scope.showInputLote = false;
        };


        $scope.getBR = function(filter) {

            $scope.showInputBR = false;
            $scope.showInputSegmento = false;
            $scope.showInputLote = false;
            $scope.uf_class = 'col-md-12';
            $scope.filter.br = null;
            var brRequest, promises, allPromise;

            if (filter && filter.sigla) {
                brRequest = RestApi.get({
                    type: 'propriedade-lindeira-br',
                    'state': filter.sigla
                });

                promises = {
                    brs: brRequest.$promise,
                };

                allPromise = $q.all(promises);
                allPromise.then(onResultBR, onError);
            }else{
                $scope.filter = {};
            }
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