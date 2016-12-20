'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:DupCtrl
 * @description
 * # DupCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('DupCtrl', function(auth, $scope, $rootScope, $q, RestApi, formData, $location, $cookies, $filter, ACCESS_LEVEL) {

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

        $scope.dups = [];
        $scope.brs = [];
        $scope.estados = formData.estados;
        $scope.showInputBR = false;
        $scope.showInputSegmento = false;
        $scope.uf_class = 'col-md-12';
        $scope.is_map = false;
        $scope.filtros = null;

        $scope.filterDup = function(filter) {
            var estado = null,
                br = null,
                seg_inicial = null,
                seg_final = null,
                filtros = {};

            if (!$scope.lastResults) {
                $scope.lastResults = $scope.dups;
            } else if (!$scope.dups.length && $scope.lastResults.length) {
                $scope.dups = $scope.lastResults;
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

            if (filter && filter.seg_inicial) {
                seg_inicial = filter.seg_inicial;
                filtros['KM_INICIO'] = seg_inicial;
            }

            if (filter && filter.seg_final) {
                seg_final = filter.seg_final;
                filtros['KM_FINAL'] = seg_final;
            }

            if (isEmpty(filtros)) {
                if (!$scope.dups.length && $scope.lastResults.length) {
                    $scope.dups = $scope.lastResults;
                }
            } else if (estado && !br && !seg_inicial && !seg_final) {
                $scope.dups = $scope.lastResults.filter(function(dup) {
                    return (dup.projeto.UF === estado)
                })
            } else if (estado && br && !seg_inicial && !seg_final) {
                $scope.dups = $scope.lastResults.filter(function(dup) {
                    return (dup.projeto.UF === estado && dup.projeto.br === br)
                })
            } else if (estado && br && seg_inicial && !seg_final) {
                $scope.dups = $scope.lastResults.filter(function(dup) {
                    return (dup.projeto.UF === estado && dup.projeto.br === br && dup.projeto.km_inicial == seg_inicial)
                })
            } else if (estado && br && seg_inicial && seg_final) {
                $scope.dups = $scope.lastResults.filter(function(dup) {
                    return (dup.projeto.UF === estado && dup.projeto.br === br &&
                        dup.projeto.km_inicial == seg_inicial && dup.projeto.km_final == seg_final)
                })
            }else if (estado && br && !seg_inicial && seg_final) {
                $scope.dups = $scope.lastResults.filter(function(dup) {
                    return (dup.projeto.UF === estado && dup.projeto.br === br &&
                          dup.projeto.km_final == seg_final)
                })
            }
        };

        $scope.getBR = function(filter) {

            $scope.showInputBR = false;
            $scope.showInputSegmento = false;
            $scope.uf_class = 'col-md-12';
            $scope.filter.br = null;
            var brRequest, promises, allPromise;

            if (filter && filter.sigla) {
                brRequest = RestApi.get({
                    type: 'projetos-br',
                    'state': filter.sigla
                });

                promises = {
                    brs: brRequest.$promise,
                };

                allPromise = $q.all(promises);
                allPromise.then(onResultBR, onError);
            }
        };


        /**
         * Resultado da requisição
         * @param data
         */
        function onResult(result) {
            $scope.dups = result.dups;
            $scope.loading = false;
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
            if (error.status === -1) {
                console.log('reload page..');
                window.location.reload();
            } else {
                $scope.loading = false;
                $scope.msg = "Não foi possivel consultar dados.";
            }
            console.log('Erro:' + error.statusText, error.status);
        }

        $scope.loading = true;

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
    .controller('DupDetailCtrl', function($scope, $rootScope, $http, $q, RestApi, formData, $location, $cookies, $routeParams, settings, ACCESS_LEVEL, auth) {

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

        if (!$routeParams.id) {
            $scope.msg = "Parâmetro inválido";
        } else {

            var id_dup = $routeParams.id;

            function onResult(result) {
                $scope.dup = result.dup;
                $scope.adicionarGeoJSON($scope.dup.geojson);
            };

            function onError(error) {
                if (error.status === -1) {
                    console.log('reload page..');
                    window.location.reload();
                } else {
                    $scope.msg = "Não foi possivel consultar dados.";
                }
                console.log('Erro:' + error.statusText, error.status);
            }
            /* Send request for restAPI */
            var dupRequest = RestApi.getDup({
                type: 'dups-detail',
                id: id_dup
            });

            var promises = {
                dup: dupRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResult, onError);

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
                $('#map').css('height', '420px');
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

        };

        $scope.donwload = function(path) {

            var url = settings.server.url + '/download/' + path;
            try {
                $.fileDownload(url, {
                    successCallback: function(url) {
                        console.log('sucess download...');
                    },
                    failCallback: function(html, url) {
                        if (html != '') {
                            console.log(html);
                        }
                    }
                });
            } catch (err) {
                console.log('error in download file ' + err);
            }

        };

    });