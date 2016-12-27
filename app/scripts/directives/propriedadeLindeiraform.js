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
                        br = filter.br !== null ? filter.br.br : null;
                        lote = filter.lote != null ? filter.lote.lote : null;
 
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
                            onEachFeature: eachLayer
                        });
                        $scope.layers[layerName] = layer;
                        $scope.propriedadeLindeiraLoad = false;
                        $scope.toggleNav('filter');
                        $scope.filterProfaixa = {};
                    }

                    function failtHandler(data) {
                        $scope.propriedadeLindeiraLoad = false;
                    }

                    function eachLayer(feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
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


                    if (estado && estado.sigla && BR && BR.br) {
                        loteRequest = RestApi.get({
                            type: 'propriedade-lindeira-lote',
                            'state': estado.sigla,
                            'br': BR.br
                        });

                        loteRequest.$promise.then(onResultLote, onError);
                    }
                };

            }
        };
    });