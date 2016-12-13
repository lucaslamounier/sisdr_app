'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:ProjetoCtrl
 * @description
 * # ProjetoCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('ProjetoCtrl', function($scope, $rootScope, $q, RestApi, formData, $location) {

        $scope.projetos = {};
        $scope.geoJsonLayer = {};
        $scope.msg = false;

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
                style: styleProjeto,
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

        function onError(err) {
            console.log('Erro:' + err);
            debugger;
            $scope.msg = "Não foi possivel consultar dados.";
        };

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
    .controller('ProjetoDetailCtrl', function($scope, $rootScope, $q, RestApi, formData, $location) {



    });