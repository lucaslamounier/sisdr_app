'use strict';

/**
 * @ngdoc directive
 * @name sisdrApp.directive:profaixaForm
 * @description
 * # profaixaForm
 */
angular.module('sisdrApp')
    .directive('profaixaForm', function(RestApi, symbologies, GISHelper, formData) {
        return {
            templateUrl: 'views/partials/profaixaForm.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                scope.estados = formData.estados;

                function resultHandler(data) {
                    scope.profaixaData = data;
                }

                function faultHandler(error) {
                    console.log(error)
                }

            },

            controller: function($scope) {

                $scope.ProfaixaSearch = function(filter) {
                    var restData, layerName, uf, br, lote;
                    $scope.profaixaLoad = true;

                    if (!isEmpty(filter)) {
                        uf = !isEmpty(filter.uf) ? filter.uf.sigla : null;
                        br = filter.br !== null ? filter.br.br : null;
                        lote = filter.lote != null ? filter.lote.lote : null;

                        if (uf && !br && !lote) {

                            layerName = 'Profaixa: ' + uf;
                            restData = RestApi.getObject({
                                type: 'profaixa-filter',
                                'state': uf,
                            });
                            restData.$promise.then(resultHandler, failtHandler);


                        } else if (uf && br && !lote) {

                            layerName = 'Profaixa: ' + uf + '-' + br;
                            restData = RestApi.getObject({
                                type: 'profaixa-filter',
                                'state': uf,
                                'br': br,
                            });
                            restData.$promise.then(resultHandler, failtHandler);


                        } else if (uf && br && lote) {

                            layerName = 'Profaixa: ' + uf + '-' + br + '-' + lote;
                            restData = RestApi.getObject({
                                type: 'profaixa-filter',
                                'state': uf,
                                'br': br,
                                'lote': lote
                            });
                            restData.$promise.then(resultHandler, failtHandler);

                        }

                    }

                    function resultHandler(data) {

                        console.log('filter profaixa sucess ...');

                        var layer = L.geoJson(data.features, {
                            onEachFeature: propertiesProfaixa
                        });
                        $scope.layers[layerName] = layer;
                        $scope.profaixaLoad = false;
                        $scope.toggleNav('filter');
                        $scope.filterProfaixa = {};
                    }

                    function failtHandler(data) {
                        $scope.profaixaLoad = false;
                    }

                    function eachLayer(feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        }
                    }

                    function propertiesProfaixa(feature, layer) {
                        if (feature.properties) {
                            var url = '#/profaixa/detail/' + feature.id;
                            var htmlLink = "<br /><a href='" + url + "' target='_blanck'>vizualizar detalhes</a>";
                            var properties = {
                                "BR": feature.properties.vl_br,
                                "Municipíos": feature.properties.li_municipio,
                                "UF": feature.properties.sg_uf,
                                "Tipo de Trecho": feature.properties.sg_tipo_trecho_display,
                                "Código rodovia": feature.properties.vl_codigo_rodovia,
                                "KM Inicial": feature.properties.vl_km_inicial,
                                "KM Final": feature.properties.vl_km_final,
                                ' ': htmlLink,
                            }
                            layer.bindPopup(GISHelper.createHTMLPopup(properties));
                        }
                    }

                }

                function onResultLote(result) {

                    if (result.length) {
                        $scope.lotes = result;
                    }
                };

                function onResultBR(result) {
                    $scope.brs = result;
                };


                function onError(error) {
                    console.log(error);
                }

                $scope.getBR = function(filter) {

                    if (filter && filter.sigla) {

                        var brRequest = RestApi.get({
                            type: 'profaixa-br',
                            'state': filter.sigla
                        });
                        brRequest.$promise.then(onResultBR, onError);
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


                        loteRequest.$promise.then(onResultLote, onError);
                    }
                };

            }
        };
    });