'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:sisdrCtrl
 * @description
 * # sisdrCtrl
 * Controller of the sisdrApp
 */

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
        }
    return JSON.stringify(obj) === JSON.stringify({});
};

angular.module('sisdrApp')
    .controller('sisdrCtrl', function($scope, $rootScope, RestApi, $cookies, $q, symbologies, GISHelper, formData, $timeout, auth, $location) {

        $scope.is_map = true;
        var profaixaLayerName = 'PROFAIXAS';
        var RodoviaLayerName = 'RODOVIAS';
        var PropriedadesLindeirasLayerName = 'PROPRIEDADES LINDEIRAS';
        $scope.filter = {};

        var user = auth.getUser();
        var username = user.username;
        var password = user.password;

        $scope.embargosToMarker = function(feature, latlng) {
            var marker;
            marker = symbologies.make(latlng, 'embargos-last');
            marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
            return marker;
        }

        /**
         * Remoção de overlayers adicionadas ao mapa, chamada por $timeout
         */

        function removeLayers() {
            $scope.map.setView([-16, -48], 4);
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

        function onEachFeatureRodovia(feature, layer) {

            if (feature.properties) {
                layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
            }
        }

        function onEachFeatureProjeto(feature, layer) {
                    var html = [
                        '<p><strong>',
                        "<a href='#/projetos/detail/'"+ feature.id +">",
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

        function propertiesRodovia(feature, layer) {
            if (feature.properties) {
                var properties = {
                    'BR': feature.properties.vl_br,
                    'UF': feature.properties.sg_uf,
                    'Início': feature.properties.ds_local_i,
                    'Fim': feature.properties.ds_local_f,
                    'KM Início': feature.properties.vl_km_inic,
                    'KM Fim': feature.properties.vl_km_fina,
                    'Jurisdição': feature.properties.ds_jurisdi,
                    'Situação': feature.properties.ds_superfi
                };
                layer.bindPopup(GISHelper.createHTMLPopup(properties));
            }
        }


        function KmlLayerLoad() {

            $scope.filter.carregar = true;

            /* KML Layers */

            var kmlLayerAC = new L.KML("kml/Imoveis_AC.kml");
            var kmlLayerAL = new L.KML("kml/Imoveis_AL.kml");
            var kmlLayerAM = new L.KML("kml/Imoveis_AM.kml");
            var kmlLayerAP = new L.KML("kml/Imoveis_AP.kml");
            var kmlLayerBA = new L.KML("kml/Imoveis_BA.kml");
            var kmlLayerCE = new L.KML("kml/Imoveis_CE.kml");
            var kmlLayerDF = new L.KML("kml/Imoveis_DF.kml");
            var kmlLayerES = new L.KML("kml/Imoveis_ES.kml");
            var kmlLayerGO = new L.KML("kml/Imoveis_GO.kml");
            var kmlLayerMA = new L.KML("kml/Imoveis_MA.kml");
            var kmlLayerMG = new L.KML("kml/Imoveis_MG.kml");
            var kmlLayerMS = new L.KML("kml/Imoveis_MS.kml");
            var kmlLayerMT = new L.KML("kml/Imoveis_MT.kml");
            var kmlLayerPA = new L.KML("kml/Imoveis_PA.kml");
            var kmlLayerPB = new L.KML("kml/Imoveis_PB.kml");
            var kmlLayerPE = new L.KML("kml/Imoveis_PE.kml");
            var kmlLayerPI = new L.KML("kml/Imoveis_PI.kml");
            var kmlLayerPR = new L.KML("kml/Imoveis_PR.kml");
            var kmlLayerRJ = new L.KML("kml/Imoveis_RJ.kml");
            var kmlLayerRN = new L.KML("kml/Imoveis_RN.kml");
            var kmlLayerRO = new L.KML("kml/Imoveis_RO.kml");
            var kmlLayerRR = new L.KML("kml/Imoveis_RR.kml");
            var kmlLayerRS = new L.KML("kml/Imoveis_RS.kml");
            var kmlLayerSC = new L.KML("kml/Imoveis_SC.kml");
            var kmlLayerSE = new L.KML("kml/Imoveis_SE.kml");
            var kmlLayerSP = new L.KML("kml/Imoveis_SP.kml");
            var kmlLayerTO = new L.KML("kml/Imoveis_TO.kml");

            function kmlBounds(e) {
                $scope.map.fitBounds(e.target.getBounds());
            }


            $scope.map.addLayer(kmlLayerAC);
            $scope.map.addLayer(kmlLayerAL);
            $scope.map.addLayer(kmlLayerAM);
            $scope.map.addLayer(kmlLayerAP);
            $scope.map.addLayer(kmlLayerBA);
            $scope.map.addLayer(kmlLayerCE);
            $scope.map.addLayer(kmlLayerDF);
            $scope.map.addLayer(kmlLayerES);
            $scope.map.addLayer(kmlLayerGO);

            $scope.filter.carregar = false;
        }

        function style(feature) {
            return {
                weight: 4,
                opacity: 0.6,
                //color: '#800080',
                color: '#2E8B57',

            };
        }

        function stylePropLindeira(feature) {
            return {
                fillColor: '#808080',
                weight: 3,
                opacity: 0.7,
                color: '#FF4500',

            };
        }

        function styleRodovia(feature) {
            return {
                fillColor: '#808080',
                weight: 3,
                opacity: 0.7,
                color: '#FF4500',

            };
        }


        function getRandomLatLng(map) {
            var bounds = map.getBounds(),
                southWest = bounds.getSouthWest(),
                northEast = bounds.getNorthEast(),
                lngSpan = northEast.lng - southWest.lng,
                latSpan = northEast.lat - southWest.lat;

            return new L.LatLng(
                southWest.lat + latSpan * Math.random(),
                southWest.lng + lngSpan * Math.random());
        }

        /**
         * Resultado da requisição
         * @param data
         */
        function onResult(result) {

            $scope.is_map = true;
            
            var markers = L.markerClusterGroup({
                chunkedLoading: true
            });
            var markers2 = L.markerClusterGroup({
                chunkedLoading: true
            });

            var markers3 = L.markerClusterGroup({
                chunkedLoading: true
            });

            var profaixa = result.profaixa.features;
            var propriedadesLindeiras = result.propriedadesLindeira.features;
            var projetos = result.projetos.features;

            var layerPropLindeira = L.geoJson(propriedadesLindeiras, {
                onEachFeature: propertiesPropLindeira,    
            });

            var layerProfaixa = L.geoJson(profaixa, {
                style: style,
                onEachFeature: propertiesProfaixa,
            });

            var layerProjeto = L.geoJson(projetos, {
                style: function(feature) {
                    return {
                        color: '#FF0000',
                        weight: 3,
                        //fillColor: '#03f',
                    }
                },
                onEachFeature: onEachFeatureProjeto,

            });

            markers.addLayer(layerPropLindeira);
            markers2.addLayer(layerProfaixa);
            markers3.addLayer(layerProjeto);

            $scope.initialLayers[PropriedadesLindeirasLayerName] = {
                'layer': markers,
                'legend': {
                    'url': 'images/icons/prop-lindeira.png',
                    'type': 'png'
                }
            };

            $scope.initialLayers[profaixaLayerName] = {
                'layer': markers2,
                'legend': {
                    'url': 'images/icons/road-perspective.png',
                    'type': 'png'
                }
            };

            $scope.initialLayers['Projetos Geométricos'] = {
                'layer': markers3,
                'legend': {
                    'url': 'images/icons/placeholder-pointing-on-a-road.png',
                    'type': 'png'
                }
            };

            var layerRodoviasFederais = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/SNV/MapServer/10",
                style: function() {
                    return {
                        color: "#2E8B57",
                        weight: 3
                    };
                },
                onEachFeature: onEachFeatureRodovia,
            });

            var layerRodoviasEstaduais = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/SNV/MapServer/11",
                style: function() {
                    return {
                        color: "#FF0000",
                        weight: 3
                    };
                },
                onEachFeature: onEachFeatureRodovia,
            });

            var layerRegiao = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/POLITICO_ADMINISTRATIVO/MapServer/1",
                style: function() {
                    return {
                        color: "#48D1CC",
                        weight: 3
                    };
                },
                onEachFeature: onEachFeatureRodovia,
            });

            var layerTerraIndigena = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/LOCALIDADES/MapServer/3",
                onEachFeature: onEachFeatureRodovia,
                style: GISHelper.embargoStyle,
            });

            var layerFerrovia = L.esri.featureLayer({
                url: "//10.100.10.231:6080/arcgis/rest/services/DNITGEO/SNV/MapServer/5",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#87CEFA",
                        weight: 3
                    };
                }
            });

            var layerPACsituacao = L.esri.featureLayer({
                url: "//10.100.10.231:6080/arcgis/rest/services/DNITGEO/PAC/MapServer/0",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#800000",
                        weight: 3
                    };
                }
            });

            var layerPACintervensao = L.esri.featureLayer({
                url: "//10.100.10.231:6080/arcgis/rest/services/DNITGEO/PAC/MapServer/1",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#800000",
                        weight: 3
                    };
                }
            });

            var layerAcentamentosRurais = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/AREAS_ESPECIAIS/MapServer/6",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#FF7F50",
                        weight: 3
                    };
                }
            });

            var layerUnidadesConservacao = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/AREAS_ESPECIAIS/MapServer/3",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#ADFF2F",
                        weight: 3
                    };
                }
            });

            var layerBiomas = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/AREAS_ESPECIAIS/MapServer/5",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#F0E68C",
                        weight: 3
                    };
                }
            });

            var layerMalhaRodoviaria = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/condicao_malha_rodoviaria/MapServer/0",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#48D1CC",
                        weight: 3
                    };
                }
            });


            var layerPortos = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/INFRAESTRUTURA/MapServer/1",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#DA70D6",
                        weight: 3
                    };
                }
            });

            var layerRefinaria = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/INFRAESTRUTURA/MapServer/4",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#A0522D",
                        weight: 3
                    };
                }
            });

            var layerBarragens = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/INFRAESTRUTURA/MapServer/5",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#800080",
                        weight: 3
                    };
                }
            });


            var layerEixoDutoviario = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/INFRAESTRUTURA/MapServer/6",
                onEachFeature: onEachFeatureRodovia,
                style: function() {
                    return {
                        color: "#FA8072",
                        weight: 3
                    };
                }
            });


            $scope.wmsLayers['Ferrovias'] = {
                'layer': layerFerrovia,
                'legend': {
                    'url': 'images/icons/tube-rails.svg',
                    'fill': '#A0522D'
                }
            };



            $scope.wmsLayers['Rodovias Federais'] = {
                'layer': layerRodoviasFederais,
                'legend': {
                    'url': 'images/icons/crossing-roads.png',
                    'type': 'png'
                }
            };



            $scope.wmsLayers['Rodovias Federais'] = {
                'layer': layerRodoviasFederais,
                'legend': {
                    'url': 'images/icons/crossing-roads.png',
                    'type': 'png'
                }
            };


            $scope.wmsLayers['Rodovias Estaduais'] = {
                'layer': layerRodoviasEstaduais,
                'legend': {
                    'url': 'images/icons/route-perspective.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['PAC - Intervensão'] = {
                'layer': layerPACintervensao,
                'legend': {
                    'url': 'images/icons/skyline.png',
                    'type': 'png',
                    'fill': '#A0522D'
                }
            };

            $scope.wmsLayers['PAC - Situação'] = {
                'layer': layerPACsituacao,
                'legend': {
                    'url': 'images/icons/RoadClosure-100.png',
                    'type': 'png',
                    'fill': '#A0522D'
                }
            };


            $scope.wmsLayers['Terras Indígenas'] = {
                'layer': layerTerraIndigena,
                'legend': {
                    'url': 'images/icons/circle-icon.png',
                    'type': 'circle',
                    'fill': '#A0522D'
                }
            };


            $scope.wmsLayers['Unidades da Federação - UF'] = {
                'layer': layerRegiao,
                'legend': {
                    'url': 'images/icons/brazil-map.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Assentamentos Rurais - INCRA'] = {
                'layer': layerAcentamentosRurais,
                'legend': {
                    'url': 'images/icons/farm.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Unidades de Conservação - MMA'] = {
                'layer': layerUnidadesConservacao,
                'legend': {
                    'url': 'images/icons/1483656243_environmental_engineer.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Biomas - MMA'] = {
                'layer': layerBiomas,
                'legend': {
                    'url': 'images/icons/bio.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Condição da Malha Rodoviária'] = {
                'layer': layerMalhaRodoviaria,
                'legend': {
                    'url': 'images/icons/road.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Portos - ANTAQ'] = {
                'layer': layerPortos,
                'legend': {
                    'url': 'images/icons/crane.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Refinarias - PNLT'] = {
                'layer': layerRefinaria,
                'legend': {
                    'url': 'images/icons/refinery.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Barragens Eclusas - PNLT '] = {
                'layer': layerBarragens,
                'legend': {
                    'url': 'images/icons/Dam-100.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Eixo Dutoviario - PNLT '] = {
                'layer': layerEixoDutoviario,
                'legend': {
                    'url': 'images/icons/axis.png',
                    'type': 'png'
                }
            };

            console.log($scope.initialLayers);

            /* Initial Layer Active */
            var controlLayers = $("#tabsOverLayers li");
            if (!controlLayers.hasClass('active')) {
                var layer = controlLayers[1];
                var outros = $("#Outros")[0];
                $("#tabLinkOutros").click();
                layer.className = "active";

            }
            $scope.filter.carregar = false;
        }

        /**
         * Tratamento da falha ao pesquisar dados
         * @param error
         */

        function onError(error) {
            console.log(error);
            $scope.filter.carregar = false;
        }

        $scope.filter.carregar = true;

        var profaixaRequest = RestApi.getPoints({
            type: 'profaixa'
        });
        var propriedadesLindeirasRequest = RestApi.getPoints({
            type: 'propriedade-lindeira'
        });

        var projetosRequest = RestApi.getProjetos({
            type: 'projetos-list',
        });

        var promises = {
            profaixa: profaixaRequest.$promise,
            propriedadesLindeira: propriedadesLindeirasRequest.$promise,
            projetos: projetosRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);

    });