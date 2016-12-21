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
        var profaixaLayerName = 'Profaixa';
        var RodoviaLayerName = 'Rodovias';
        var PropriedadesLindeirasLayerName = 'Propriedades Lindeiras';
        $scope.filter = {};

        var user = auth.getUser();
        var username = user.username;
        var password = user.password;

        /**
         * Remoção de overlayers adicionadas ao mapa, chamada por $timeout
         */

        function removeLayers() {
            $scope.map.setView([-16, -48], 4);
        }

        function propertiesProfaixa(feature, layer) {
            if (feature.properties) {
                var properties = {
                    "BR": feature.properties.vl_br,
                    "Municipíos": feature.properties.li_municipio,
                    "UF": feature.properties.sg_uf,
                    "Tipo de Trecho": feature.properties.sg_tipo_trecho_display,
                    "Código rodovia": feature.properties.vl_codigo_rodovia,
                    "KM Inicial": feature.properties.vl_km_inicial,
                    "KM Final": feature.properties.vl_km_final
                }
                layer.bindPopup(GISHelper.createHTMLPopup(properties));
            }
        }

        function propertiesPropLindeira(feature, layer) {
            if (feature.properties) {
                var properties = {
                    'Município': feature.properties.nm_municipio,
                    'UF': feature.properties.sg_uf,
                    'Propriedade': feature.properties.nm_propriedade,
                    'Proprietário': feature.properties.nm_proprietario
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

            /*  kmlLayerAC.on("loaded", kmlBounds);
              kmlLayerAL.on("loaded", kmlBounds);                                           
              kmlLayerAM.on("loaded", kmlBounds);  
              kmlLayerAP.on("loaded", kmlBounds);
              kmlLayerBA.on("loaded", kmlBounds);
              kmlLayerCE.on("loaded", kmlBounds);
              kmlLayerDF.on("loaded", kmlBounds);
              kmlLayerES.on("loaded", kmlBounds);
              kmlLayerGO.on("loaded", kmlBounds);
              kmlLayerMA.on("loaded", kmlBounds);
              kmlLayerMG.on("loaded", kmlBounds);
              kmlLayerMS.on("loaded", kmlBounds);
              kmlLayerMT.on("loaded", kmlBounds);
              kmlLayerPA.on("loaded", kmlBounds);
              kmlLayerPB.on("loaded", kmlBounds);
              kmlLayerPE.on("loaded", kmlBounds);
              kmlLayerPI.on("loaded", kmlBounds);
              kmlLayerPR.on("loaded", kmlBounds);
              kmlLayerRJ.on("loaded", kmlBounds);
              kmlLayerRN.on("loaded", kmlBounds);
              kmlLayerRO.on("loaded", kmlBounds);
              kmlLayerRR.on("loaded", kmlBounds);
              kmlLayerRS.on("loaded", kmlBounds);
              kmlLayerSC.on("loaded", kmlBounds);
              kmlLayerSE.on("loaded", kmlBounds);
              kmlLayerSP.on("loaded", kmlBounds);
              kmlLayerTO.on("loaded", kmlBounds);*/

            $scope.map.addLayer(kmlLayerAC);
            $scope.map.addLayer(kmlLayerAL);
            $scope.map.addLayer(kmlLayerAM);
            $scope.map.addLayer(kmlLayerAP);
            $scope.map.addLayer(kmlLayerBA);
            $scope.map.addLayer(kmlLayerCE);
            $scope.map.addLayer(kmlLayerDF);
            $scope.map.addLayer(kmlLayerES);
            $scope.map.addLayer(kmlLayerGO);
            /*$scope.map.addLayer(kmlLayerMA);
                $scope.map.addLayer(kmlLayerMG);
                $scope.map.addLayer(kmlLayerMS);
                $scope.map.addLayer(kmlLayerMT);
                $scope.map.addLayer(kmlLayerPA);
                $scope.map.addLayer(kmlLayerPA);
                $scope.map.addLayer(kmlLayerPB);
                $scope.map.addLayer(kmlLayerPE);
                $scope.map.addLayer(kmlLayerPI);
                $scope.map.addLayer(kmlLayerPR);
                $scope.map.addLayer(kmlLayerRJ);
                $scope.map.addLayer(kmlLayerRN);
                $scope.map.addLayer(kmlLayerRO);
                $scope.map.addLayer(kmlLayerRR);
                $scope.map.addLayer(kmlLayerRS);
                $scope.map.addLayer(kmlLayerSC);
                $scope.map.addLayer(kmlLayerSE);
                $scope.map.addLayer(kmlLayerSP);
                $scope.map.addLayer(kmlLayerTO);

            */

            $scope.filter.carregar = false;
        }

        function style(feature) {
            return {
                fillColor: '#000080',
                weight: 5,
                opacity: 0.7,
                color: '#000080',

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

        /**
         * Resultado da requisição
         * @param data
         */
        function onResult(result) {

            $scope.is_map = true;
            var profaixa = result.profaixa.features;
            var propriedadesLindeiras = result.propriedadesLindeira.features;
            //var rodovias = result.rodovias.features;

            /* console.log('Total de rodovias: ' + rodovias.length);*/

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

            $scope.initialLayers[PropriedadesLindeirasLayerName] = {
                'layer': L.geoJson(propriedadesLindeiras, {
                    style: stylePropLindeira,
                    onEachFeature: propertiesPropLindeira,
                }),
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
                }
            });

            var layerRodoviasEstaduais = L.esri.featureLayer({
                url: "//servicos.dnit.gov.br/arcgis/rest/services/DNIT_Geo/SNV/MapServer/11",
                style: function() {
                    return {
                        color: "#FF0000",
                        weight: 3
                    };
                }
            });


            $scope.wmsLayers['Rodovias Federais'] = {
                'layer': layerRodoviasFederais,
                'legend': {
                    'url': 'images/icons/prop-lindeira.png',
                    'type': 'png'
                }
            };

            $scope.wmsLayers['Rodovias Estaduais'] = {
                'layer': layerRodoviasEstaduais,
                'legend': {
                    'url': 'images/icons/prop-lindeira.png',
                    'type': 'png'
                }
            };

            /*$scope.initialLayers[RodoviaLayerName] = {
                'layer': L.geoJson(rodovias, {
                    onEachFeature: propertiesRodovia,
                    style: styleRodovia,
                }),
                'legend': {
                    'url': 'images/icons/two-roads-cross.png',
                    'type': 'png'
                }
            };*/
            //KmlLayerLoad();

            console.log('add layer to map');
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

            //$timeout(removeCache, 1000);
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
        /*var rodoviasRequest = RestApi.getPoints({
            type: 'rodovia'
        });*/


        var promises = {
            profaixa: profaixaRequest.$promise,
            propriedadesLindeira: propriedadesLindeirasRequest.$promise,
            /* rodovias: rodoviasRequest.$promise,*/
        };

        var allPromise = $q.all(promises);
        allPromise.then(onResult, onError);

    });