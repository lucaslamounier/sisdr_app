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
        $scope.estados = formData.estados;
        $scope.showInputLote = false;
        $scope.button_position = 'button-initial';
        
        
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
            } else {
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


        $scope.cleanFilters = function() {

            $scope.filter = {};
            $scope.showInputBR = false;
            $scope.showInputSegmento = false;
            $scope.showInputLote = false;
        };

        $scope.filterProfaixa = function(filter) {
            var estado = null,
                br = null,
                lote = null,
                seg_inicial = null,
                seg_final = null,
                filtros = {};

            if (!$scope.lastResults) {
                $scope.lastResults = $scope.profaixas;
            } else if (!$scope.profaixas.length && $scope.lastResults.length) {
                $scope.profaixas = $scope.lastResults;
            }

            /* Checa os filtros */
            if (filter && filter.estado && filter.estado.sigla) {
                estado = filter.estado.sigla;
                filtros['UF'] = estado;
            }

            if (filter && filter.br && filter.br.br) {
                br = filter.br.br;
                filtros['BR'] = br;
            }

            if (filter && filter.lote && filter.lote.lote) {
                lote = filter.lote.lote;
                filtros['lote'] = lote;
            }

            if (filter && filter.seg_inicial) {
                seg_inicial = filter.seg_inicial;
                filtros['KM_INICIO'] = seg_inicial;
            }

            if (filter && filter.seg_final) {
                seg_final = filter.seg_final;
                filtros['KM_FINAL'] = seg_final;
            }

            if (isEmpty(filtros)) {
                if (!$scope.profaixas.length && $scope.lastResults.length) {
                    $scope.profaixas = $scope.lastResults;
                } else if ($scope.profaixas.length !== $scope.lastResults.length) {
                    $scope.profaixas = $scope.lastResults;
                }
            } else if (estado && !br && !lote && !seg_inicial && !seg_final) {
                $scope.profaixas = $scope.lastResults.filter(function(profaixa) {
                    return (profaixa.properties.sg_uf === estado)
                })
            } else if (estado && br && !lote && !seg_inicial && !seg_final) {
                $scope.profaixas = $scope.lastResults.filter(function(profaixa) {
                    //console.log("profaixa: " + JSON.stringify(profaixa.properties) );
                    //console.log("estado: " + estado + "br: " + br );
                    //debugger;
                    return (profaixa.properties.sg_uf === estado && profaixa.properties.vl_br === br)
                })
            } else if (estado && br && lote && !seg_inicial && !seg_final) {
                $scope.profaixas = $scope.lastResults.filter(function(profaixa) {
                    return (profaixa.properties.sg_uf === estado && profaixa.properties.vl_br === br &&
                        profaixa.properties.vl_lote === lote)
                })
            } else if (estado && br && lote && seg_inicial && !seg_final) {
                $scope.profaixas = $scope.lastResults.filter(function(profaixa) {
                    return (profaixa.properties.sg_uf === estado && profaixa.properties.vl_br === br &&
                        profaixa.properties.vl_lote === lote && profaixa.properties.vl_km_inicial == String(seg_inicial))
                })
            } else if (estado && br && lote && !seg_inicial && seg_final) {
                $scope.profaixas = $scope.lastResults.filter(function(profaixa) {
                    return (profaixa.properties.sg_uf === estado && profaixa.properties.vl_br === br &&
                        profaixa.properties.vl_lote === lote && profaixa.properties.vl_km_final == String(seg_final))
                })
            } else if (estado && br && lote && seg_inicial && seg_final) {
                $scope.profaixas = $scope.lastResults.filter(function(profaixa) {
                    return (profaixa.properties.sg_uf === estado && profaixa.properties.vl_br === br &&
                        profaixa.properties.vl_lote === lote && profaixa.properties.vl_km_inicial == String(seg_inicial) &&
                        profaixa.properties.vl_km_final == String(seg_final))
                })
            }
        };


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
            $scope.loading = false;
            updateFitBounds($scope.geoJSON);


        };
        $scope.loading = true;

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

        $scope.getBR = function(filter) {

            $scope.showInputBR = false;
            $scope.showInputSegmento = false;
            $scope.showInputLote = false;
            $scope.filter.br = null;
            var brRequest, promises, allPromise;

            if (filter && filter.sigla) {
                brRequest = RestApi.get({
                    type: 'profaixa-br',
                    'state': filter.sigla
                });

                promises = {
                    brs: brRequest.$promise,
                };

                allPromise = $q.all(promises);
                allPromise.then(onResultBR, onError);
            }
        };

        $scope.getLote = function(estado, BR) {
            var loteRequest, promises, allPromise;


            if (estado && estado.sigla && BR && BR.br) {
                loteRequest = RestApi.get({
                    type: 'profaixa-lote',
                    'state': estado.sigla,
                    'br': BR.br
                });

                promises = {
                    lotes: loteRequest.$promise,
                };

                allPromise = $q.all(promises);
                allPromise.then(onResultLote, onError);
            }
        };

        function onResultLote(result) {
            if (result.lotes.length) {
                $scope.lotes = result.lotes;
                $scope.showInputLote = true;
            }

        }

        function onResultBR(result) {
            if (result.brs.length) {
                $scope.brs = result.brs;
                $scope.showInputBR = true;
                $scope.showInputSegmento = true;
                $scope.showInputLote = true;
            }

        }

        function onError(error) {
            if (error.status === -1) {
                console.log('reload page..');
                window.location.reload();
            } else {
                $scope.showInputLote = false;
                $scope.loading = false;
                $scope.msg = "Não foi possivel consultar dados.";
            }
            $scope.loading = false;
            console.log('Erro:' + error.statusText, error.status);
        }

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
            } else {
                $scope.msg = "Não foi possivel consultar dados.";
            }
            console.log('Erro:' + error.statusText, error.status);
        };

        function onResult(result) {
            $scope.profaixa = result.profaixa;
            $scope.municipios_profaixa = '';
            $scope.adicionarGeoJSON($scope.profaixa.properties.geojson);
            for (var i = 0; i < $scope.profaixa.properties.li_municipio.length; i++) {
                $scope.municipios_profaixa += $scope.profaixa.properties.li_municipio[i];
                if ($scope.profaixa.properties.li_municipio[i + 1]) {
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