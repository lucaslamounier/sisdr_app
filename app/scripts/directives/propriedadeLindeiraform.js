'use strict';

/**
 * @ngdoc directive
 * @name sisdrApp.directive:propriedadeForm
 * @description
 * # propriedadeForm
 */
angular.module('sisdrApp')
    .directive('propriedadeForm', function(RestApi, symbologies, GISHelper, formData) {
        return {
            templateUrl: 'views/partials/propriedadesLindeirasForm.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                scope.estados = formData.estados;

                function resultHandler(data) {
                    scope.projetosData = data;
                }

                function faultHandler(error) {
                    console.log(error)
                }
                
            },

          controller: function($scope) {

                $scope.PropriedadeLindeiraSearch = function(filter) {
                    var restData, layerName, uf, br, lote;
                    $scope.propriedadeLindeiraLoad = true;
                    if(!isEmpty(filter)){
                        uf = !isEmpty(filter.uf) ? filter.uf.sigla: null;
                        br = filter.br ? filter.br.vl_br : null;
                        lote = filter.lote ? filter.lote.vl_lote : null;
 
                        if(uf && !br && !lote){

                           layerName = 'Propriedade Lindeira: ' + uf;
                           restData = RestApi.getObject({
                                type: 'propriedade-lindeira-filter',
                                'state': uf,
                            });                     
                            restData.$promise.then(resultHandler, failtHandler);
                            

                        }else if(uf && br && !lote){

                           layerName = 'Propriedade Lindeira: ' + uf + '-' + br;
                           restData = RestApi.getObject({
                                type: 'propriedade-lindeira-filter',
                                'state': uf,
                                'br': br,
                            }); 

                            restData.$promise.then(resultHandler, failtHandler);
                          
                          
                        }else if(uf && br && lote){

                           layerName = 'Propriedade Lindeira: ' +  uf + '-' + br + '-' + lote;
                           restData = RestApi.getObject({
                                type: 'propriedade-lindeira-filter',
                                'state': uf,
                                'br': br,
                                'lote': lote
                           });      

                           restData.$promise.then(resultHandler, failtHandler);
                           
                        }

                    }

                    function resultHandler(data) {
                        console.log('filter propriedade lindeira sucess ...');

                        var layer = L.geoJson(data.features, {
                            onEachFeature: propertiesPropLindeira,
                            style: style,
                        });
                        $scope.layers[layerName] = layer;
                        $scope.propriedadeLindeiraLoad = false;
                        $scope.toggleNav('filter');
                        $scope.filterPropLind = {};
                    }

                    function failtHandler(data) {
                        $scope.propriedadeLindeiraLoad = false;
                    }

                    function style(feature) {
                            return {
                                weight: 3,
                                opacity: 0.7,
                                color: '#7CFC00',

                            };
                    }

                    function propertiesPropLindeira(feature, layer) {
                        if (feature.properties) {
                            var url = '#/propriedades-lindeiras/detail/' + feature.properties.id_propriedade;
                            var htmlLink = "<br /><a href='" + url + "' target='_blanck'>vizualizar detalhes</a>";
                            var properties = {
                                'Município': feature.properties.nm_municipio,
                                'UF': feature.properties.sg_uf,
                                'Propriedade': feature.properties.nm_propriedade,
                                'Proprietário': feature.properties.nm_proprietario,
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

                function onResultBR(result){
                    $scope.brs = result;
                };

              
                function onError(error){
                    console.log(error);
                }

                $scope.getBR = function(filter) {

                    if (filter && filter.sigla) {

                        var brRequest = RestApi.get({
                            type: 'propriedade-lindeira-br',
                            'state': filter.sigla
                        });                     
                        brRequest.$promise.then(onResultBR, onError);
                    }
                };

                $scope.getLote = function(estado, BR) {
                    var loteRequest, promises, allPromise;

                    if (estado && estado.sigla && BR && BR.vl_br) {
                        loteRequest = RestApi.get({
                            type: 'propriedade-lindeira-lote',
                            'state': estado.sigla,
                            'br': BR.vl_br
                        });

                        loteRequest.$promise.then(onResultLote, onError);
                    }
                };

            }
        };
    });