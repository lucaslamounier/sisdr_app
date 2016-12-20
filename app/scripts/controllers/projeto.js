'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:ProjetoCtrl
 * @description
 * # ProjetoCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('ProjetoCtrl', function($scope, $rootScope, $q, RestApi, formData, $location, $route,  auth, $cookies, ACCESS_LEVEL) {

        $scope.projetos = [];
        $scope.geoJsonLayer = {};
        $scope.msg = false;

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
        

        function styleProjeto(feature) {
            return {
                fillColor: '#808080',
                weight: 3,
                opacity: 0.7,
                color: '#FF4500',

            };
        }

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
            $scope.projetos = result.projetos.features;
            $scope.geoJSON = L.geoJson($scope.projetos, {
                style: function(feature) {
                    return {
                        color: '#03f',
                        weight: 4,
                        fillColor: '#03f',
                    }
                },
                onEachFeature: function(feature, layer) {
                    var name = 'projeto_' + feature.id;
                    $scope.geoJsonLayer[name] = layer;
                    var html = [
                        '<p><strong>',
                        "<a href=''>",
                        feature.properties.vl_codigo_projeto,
                        '</a>',
                        '</strong>',
                        '</p>',
                        '<div class="btn-group btn-group-sm">',
                        '<div>',
                        '<p><strong>BR:</strong> ' + feature.properties.vl_br + '<br />',
                        '<strong>UF: </strong>: ' + feature.properties.sg_uf + '<br />',
                        '<strong>KM Inicial: </strong>: ' + feature.properties.vl_km_inicial + '<br />',
                        '<strong>KM Final: </strong> ' + feature.properties.vl_km_final + '<br />',
                        '<strong>Empresa Responsável: </strong> ' + feature.properties.empresa_responsavel + '<br />',
                        '<strong>Tipo de Projeto: </strong> ' + feature.properties.ds_tipo_projeto_display + '<br />',
                        '<strong>Tipo de Trecho: </strong> ' + feature.properties.sg_tipo_trecho_display + '<br />',
                        '<strong>Tipo de Obra: </strong>: ' + feature.properties.ds_tipo_obra_display + '</p>',
                        '</div>',
                        '</div>'
                    ].join('');
                    layer.bindPopup(html);
                },
                
            });
            $scope.msg = false;
            $scope.geoJSON.addTo($scope.map);
            updateFitBounds($scope.geoJSON);
        };

        $scope.seeOnMap = function(id) {

            id = 'projeto_' + id;
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

        function onError(error) {
            if (error.status === -1) {
                console.log('reload page..');
                window.location.reload();
            }else{
                $scope.msg = "Não foi possivel consultar dados.";
            } 
            console.log('Erro:' + error.statusText, error.status);
        }

        /* Send request for restAPI */
        var projetosRequest = RestApi.getProjetos({
            type: 'projetos-list',
        });

        var promises = {
            projetos: projetosRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);


    });


angular.module('sisdrApp')
    .controller('ProjetoDetailCtrl', function($scope, $rootScope, $q, RestApi, formData, $location, $routeParams, settings) {

        $scope.msg = false;
        $scope.is_map = false;
        $scope.showDivWkt = false;
        $scope.checked = true;


        $('#myModal').on('shown.bs.modal', function () {
            $('#myInput').focus()
        });

        $('#myTabs a').click(function (e) {
          e.preventDefault()
          $(this).tab('show')
        });

        if (!$routeParams.id) {
            $scope.msg = "Parâmetro inválido";

        } else {

            var id_project = $routeParams.id;

            function onResult(result) {
                $scope.projeto = result.projeto;
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

            /* Send request for restAPI */
            var projetoRequest = RestApi.getProjetoDetail({
                type: 'projetos-c-detail',
                id: id_project
            });

            var promises = {
                projeto: projetoRequest.$promise,
            };

            var allPromise = $q.all(promises);
            allPromise.then(onResult, onError);

            $scope.adicionarGeoJSON = function(geoJSON) {

                if (typeof geoJSON == 'object') {
                    var layer = L.geoJson(geoJSON, {
                        style: {
                            fillColor: '#8B0000',
                            weight: 3,
                            color: '#FF0000',
                        }
                    }).addTo($scope.map);

                    $scope.updateFitBounds(layer);
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

            $scope.pegarBuffer = function(buffer) {
                
                buffer = JSON.parse(buffer);
                
                var buffer_wkt = buffer[0];
                var buffer_geoJson = buffer[1];
                var buffer_texto = buffer[2];
                               
                if(buffer_geoJson === 'None') {
                    return;
                } else {
                    printWKT(buffer_wkt);
                    printWktText(buffer_texto);
                    $scope.checked = false;
                    $scope.adicionarGeoJSON(JSON.parse(buffer_geoJson));
                }
            }

            function printHelp() {
                document.getElementById('texto-ctrl-c').style.display = 'initial';
            };
        
            function printWKT(buffer_wkt) {
                document.getElementById('wkt-text1').innerHTML = buffer_wkt;
            };

            function printWktText(buffer_wkt) {
                document.getElementById('wkt-text2').innerHTML = buffer_wkt;
            };


            $scope.selectText = function(element) {
                var doc = document,
                    text = doc.getElementById(element),
                    range,
                    selection;
                
                if (doc.body.createTextRange) {
                    range = document.body.createTextRange();
                    range.moveToElementText(text);
                    range.select();
                } else if (window.getSelection) {
                    selection = window.getSelection();
                    range = document.createRange();
                    range.selectNodeContents(text);
                    selection.removeAllRanges();
                    selection.addRange(range);
                };

                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                    console.log('Copying text command was ' + msg);
                    printHelp();
                } catch (err) {
                    console.log('Oops, unable to copy');
                }   
                
            };


        };
         /* End else */

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
                console.log('err' + err);
            }

        };
       

    });