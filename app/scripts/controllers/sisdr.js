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
}

angular.module('sisdrApp')
    .controller('sisdrCtrl', function($scope, $rootScope, RestApi, $cookies, $q, symbologies, GISHelper, formData, $timeout, auth, $localStorage, $location) {

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
                //fillColor: '#000080',
                weight: 3,
                opacity: 0.7,
                color: '#800080',

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

        function pointToLayer(feature, latlng) {
            var html = populatePopup(feature);
            return $scope.markers.addLayer(L.circleMarker(latlng).bindPopup(html));
        }

        function populatePopup(object) {
            debugger;
              var html = '',
                categoria = $scope.filter.categoria.nome,
                subcategoria = $scope.filter.subcategoria ? $scope.filter.subcategoria.nome : null,
                count = 0,
                properties;

              properties = object.properties;

              html += '<b>Razão social:</b> ' + properties.nome + '<br/><br/>';
              html += '<b>CNPJ:</b> ' + properties.cnpj + '<br/>';
              
              if(Auth.isLoggedIn())
              {
                html += '<b>Fantasia:</b> ' + properties.nome_fantasia + '<br/>';
                html += '<b>Porte:</b> ' + properties.porte + '<br/>';
                html += '<b>Certificado regularidade da pessoa jurídica:</b> ' + (properties.regularidade ? 'Possui Certificado de Regularidade Válido' : 'Não Possui Certificado de Regularidade Válido')+ '<br/><br/>';
                html += '<br/><b>Última atualização do dado em: </b> ' + (properties.data_atualizacao ? properties.data_atualizacao : 'Sem informação de atualização da base de dados')    + '<br/><br/>';
              }

              angular.forEach(properties.atividades, function(atividade, key) {

                if(atividade.categoria == categoria && (!subcategoria || atividade.subcategoria === subcategoria)) {

                  if(count)

                    html += '<hr />';

                  html += '<b>Categoria:</b> ' + atividade.categoria + '<br/>';
                  html += '<b>Atividade:</b> ' + atividade.subcategoria + '<br/>';

                  if(Auth.isLoggedIn()){
                    if( atividade.grau_poluicao == 'Sem')
                      atividade.grau_poluicao = '---'
                    html += '<b>Grau de Poluicao:</b> ' + atividade.grau_poluicao  + '<br/>';
                  }


                  count++;
                }
        });

      return html;
    }


        /**
         * Resultado da requisição
         * @param data
         */
        function onResult(result) {

            $scope.is_map = true;
            $scope.markers = new L.MarkerClusterGroup();
            var profaixa = result.profaixa.features;
            var propriedadesLindeiras = result.propriedadesLindeira.features;

            $scope.markers = new L.MarkerClusterGroup();

            $scope.initialLayers[profaixaLayerName] = {
                'layer': L.geoJson(profaixa, {
                    style: style,
                    onEachFeature: propertiesProfaixa,
                }),
                'legend': {
                    'url': 'images/icons/road-perspective.png',
                    'type': 'png'
                }
            };

            var layerPropLindeira = L.geoJson(propriedadesLindeiras, {
                style: stylePropLindeira,
                pointToLayer: pointToLayer,
                onEachFeature: propertiesPropLindeira,
                
            })

           $scope.initialLayers[PropriedadesLindeirasLayerName] = {
                'layer': layerPropLindeira,
                'legend': {
                    'url': 'images/icons/prop-lindeira.png',
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
                pointToLayer: $scope.embargosToMarker,
                style: GISHelper.embargoStyle,
            });

            /*pointToLayer (geojson, latlng) {
      return L.shapeMarkers.diamondMarker(latlng, 5, {
        color: '#0099FF',
        weight: 2
      })
*/
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
            /*  var layerPAC = L.esri.featureLayer({
                 url: "//10.100.10.231:6080/arcgis/rest/services/DNITGEO/PAC/MapServer/1",
                 style: function() {
                     return {
                         color: "#FF0000",
                         weight: 3
                     };
                 },onEachFeature: onEachFeatureRodovia,
             });

             $scope.wmsLayers['Obras do PAC'] = {
                 'layer': layerPAC,
                 'legend': {
                     'url': '//10.100.10.231:6080/arcgis/rest/services/DNITGEO/PAC/MapServer/legend',
                     'type': 'png'
                 }
             };*/


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

            $scope.wmsLayers['UF - Unidades da Federação'] = {
                'layer': layerRegiao,
                'legend': {
                    'url': 'images/icons/pol-icon.png',
                    'type': 'png'
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

            $scope.wmsLayers['Ferrovias'] = {
                'layer': layerFerrovia,
                'legend': {
                    'url': 'images/icons/tube-rails.svg',
                    'fill': '#A0522D'
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
            console.error(error);
            $scope.filter.carregar = false;
        }

        $scope.filter.carregar = true;
        var profaixaRequest = RestApi.getPoints({
            type: 'profaixa'
        });
        var propriedadesLindeirasRequest = RestApi.getPoints({
            type: 'propriedade-lindeira'
        });

        var promises = {
            profaixa: profaixaRequest.$promise,
            propriedadesLindeira: propriedadesLindeirasRequest.$promise,
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);

    });