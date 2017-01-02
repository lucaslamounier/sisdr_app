'use strict';

/**
 * @ngdoc directive
 * @name sisdrApp.directive:projetosForm
 * @description
 * # projetosForm
 */
angular.module('sisdrApp')
    .directive('projetosForm', function(RestApi, symbologies, GISHelper, formData) {
        return {
            templateUrl: 'views/partials/projetosForm.html',
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

                $scope.ProjetosSearch = function(filter) {
                    var restData, layerName, uf, br, empreendimento;
                    $scope.projetosLoad = true;

                    if(!isEmpty(filter)){
                        uf = !isEmpty(filter.uf) ? filter.uf.sigla: null;
                        br = filter.br !== null ? filter.br.br : null;
                        empreendimento = filter.empreendimento != null ? filter.empreendimento.id_projeto : null;
 
                        if(uf && !br && !empreendimento){

                           layerName = 'Projeto: ' + uf;
                           restData = RestApi.getObject({
                                type: 'projetos-filter',
                                'state': uf,
                            });                     
                            restData.$promise.then(resultHandler, failtHandler);
                           
                        }else if(uf && br && !empreendimento){

                           layerName = 'Projeto: ' + uf + '-' + br;
                           restData = RestApi.getObject({
                                type: 'projetos-filter',
                                'state': uf,
                                'br': br,
                            });                     
                            restData.$promise.then(resultHandler, failtHandler);
                                                    
                        }else if(uf && br && empreendimento){

                           layerName = 'Projeto: ' + filter.empreendimento.vl_codigo_projeto;
                           restData = RestApi.getObject({
                                type: 'projetos-filter',
                                'state': uf,
                                'br': br,
                                'empreendimento': empreendimento
                           });                     
                           restData.$promise.then(resultHandler, failtHandler);
                        }

                    }

                    function resultHandler(data) {
                        console.log('filter project sucess ...');

                        var layer = L.geoJson(data, {
                            onEachFeature: propertiesProjetos
                        });

                        $scope.layers[layerName] = layer;
                        $scope.projetosLoad = false;
                        $scope.toggleNav('filter');
                        $scope.filterMap = {};
                    }

                    function failtHandler(data) {
                        $scope.projetosLoad = false;
                    }

                    function eachLayer(feature, layer) {
                        if (feature.properties) {
                            layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
                        }
                    }

                    function propertiesProjetos(feature, layer) {
                        if (feature.properties) {
                            var url = '#/projetos/detail/' + feature.id;
                            var htmlLink = "<br /><a href='" + url + "' target='_blanck'>vizualizar detalhes</a>";
                            var properties = {
                                'BR': feature.properties.br,
                                'Empresa responsável': feature.properties.empresa_responsavel,
                                'Tipo de Obra ': feature.properties.ds_tipo_obra_display,
                                'Tipo de Projeto': feature.properties.ds_tipo_projeto_display,
                                'Tipo de Trecho': feature.properties.sg_tipo_trecho_display,
                                'KM Início': feature.properties.vl_km_inicial,
                                'KM Fim': feature.properties.vl_km_final,
                                'UF': feature.properties.sg_uf,
                                'Lote': feature.properties.vl_lote,
                                ' ': htmlLink,
                              
                            };
                            layer.bindPopup(GISHelper.createHTMLPopup(properties));
                    }
        }
                
                }

                function onResultBR(result){
                    $scope.brs = result;
                };

                function onResultEmpreendimento(result){
                    $scope.empreendimentos = result;
                };

                function onErrorBr(error){
                    console.log('error projetos search rodovias', error);
                }

                function onErrorEmpreendimento(error){
                    console.log('error projetos search empreendimentos', error);
                }

                $scope.getBR = function(filter) {

                    $scope.filterMap.br = null;

                    if (filter && filter.sigla) {

                        var brRequest = RestApi.get({
                            type: 'projetos-br',
                            'state': filter.sigla
                        });                     
                        brRequest.$promise.then(onResultBR, onErrorBr);
                    }
               };

               $scope.getEmpreendimento = function(filter){

                    if(filter && filter.br.br && filter.uf.sigla){
                        var empreendimentoRequest = RestApi.get({
                            type: 'projetos-empreendimentos-list',
                            'state': filter.uf.sigla,
                            'br': filter.br.br,
                        });

                        empreendimentoRequest.$promise.then(onResultEmpreendimento, onErrorEmpreendimento);
                    }
               };
            }
        };
    });