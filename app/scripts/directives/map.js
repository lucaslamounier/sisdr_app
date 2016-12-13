'use strict';

/**
 * @ngdoc directive
 * @name sisdrApp.directive:map
 * @description
 * # map
 */

angular.module('sisdrApp')
    .directive('map', function() {
        return {
            template: '<div id="map" control-switch resizable ng-style="{height: windowHeight-70}"></div>',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                var date,
                    mapOSM,
                    googleSat,
                    mapPositron,
                    mapDark,
                    layers = {},
                    baseMaps = {},
                    initialLayers = {},
                    wmsLayers = {},
                    layersControl;

                date = new Date();

                mapOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                });

                mapPositron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                });

                mapDark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                });

                googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                });

                if (date.getHours() >= 18 || date.getHours() <= 5) {
                    scope.map = L.map('map', {
                        layers: [mapDark]
                    });
                } else {
                    scope.map = L.map('map', {
                        layers: [mapOSM]
                    });
                }

                scope.map.setView([-16, -48], 4);

                scope.control = new L.control.switch({
                    "OpenStreetMap": {
                        layer: mapOSM
                    },
                    "CartoDB Positron": {
                        layer: mapPositron
                    },
                    "CartoDB Dark": {
                        layer: mapDark
                    },
                    "Google Satellite": {
                        layer: googleSat
                    }
                }, {}).addTo(scope.map);


                scope.layers = layers;
                scope.initialLayers = initialLayers;
                scope.$watchCollection('layers', onLayersChange);
                scope.$watchCollection('initialLayers', onInitialLayersChange);


                function onWMSLayersChange(value, oldValue) {
                    //var tooltip = '';
                    var tooltip = "Você deve estar logado no geoserver para visualizar esta camada";
                    toggleLayers(value, oldValue, false, false, 'wmsLayers', tooltip);
                }

                /**
                 * Ouvinte da alteração de camadas na aplicação.
                 * @param value
                 */
                function onLayersChange(value, oldValue) {
                    toggleLayers(value, oldValue, true, true, null)
                }

                /**
                 * Ouvinte da alteração de camadas iniciais da aplicação
                 * @param value
                 */
                function onInitialLayersChange(value, oldValue) {
                    toggleLayers(value, oldValue, false, true, null)
                }

                /**
                 * Verifica qual diferença há entre value e oldValue e aplica ao mapa
                 * @param currentLayers
                 * @param oldLayers
                 * @param allowRemove
                 */
                function toggleLayers(currentLayers, oldLayers, allowRemove, initVisible, tabName, tooltip) {
                    var layerName, layer, legend, tooltip;
                    tabName = tabName || '';
                    //Identifica novas camadas
                    for (layerName in currentLayers) {
                        if (currentLayers.hasOwnProperty(layerName)) {
                            if (oldLayers.hasOwnProperty(layerName)) {
                                delete oldLayers[layerName]
                            } else {
                                layer = currentLayers[layerName];

                                if (layer.legend) {
                                    legend = layer.legend;
                                    layer = layer.layer;
                                } else {
                                    legend = null;
                                }

                                if (initVisible)
                                    layer.addTo(scope.map);
                                updateFitBounds(layer);
                                scope.control.addOverLayer(layer, layerName, tabName, allowRemove, legend, tooltip);
                            }
                        }
                    }

                    // Identifica camadas removidas
                    for (layerName in oldLayers) {
                        if (oldLayers.hasOwnProperty(layerName)) {
                            layer = oldLayers[layerName];
                            scope.control.removeLayer(layer); //Remove da lista de camadas
                            // layersControl.removeLayer(layer) //Remove da lista de camadas
                        }
                    }
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
                        scope.map.fitBounds(bounds);
                        updated = true;
                    }
                    return updated;
                }
            }
        };
    });