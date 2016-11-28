'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:map
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
                    }
                }, {}, {
                    wmsLayers: {
                        icon: "images/icons/world.png",
                        name: null
                    }
                }).addTo(scope.map);

                scope.popup = function(content) {
                    var html;

                    var element = content.features[0];
                    var layername = element.id.split('.')[0];

                    var layerTitle = Object.keys(scope.wmsLayers).filter(function(k, v) {
                        var wmsParams = scope.wmsLayers[k].layer.wmsParams;
                        if (element.properties.hasOwnProperty('tipo')) {
                            return (wmsParams.layers.split(':')[1] == layername) && (wmsParams.viewparams == ('tipo:' + element.properties.tipo));
                        } else {
                            return wmsParams.layers.split(':')[1] == layername;
                        }
                    });

                    if ($.isArray(layerTitle)) {
                        layerTitle = layerTitle[0];
                    } else {
                        layerTitle = 'Camada WMS';
                    }

                    html = '<h3>' + layerTitle + '</h3>';
                    html += '<table class="table table-striped">';

                    for (var property in content.features[0].properties) {
                        html += '<tr>';
                        html += '<td><b>' + property + '</b></td>';
                        html += '<td>' + content.features[0].properties[property] + '</td>';
                        html += '</tr>';

                    }
                    html += '</table>';

                    return html;
                }

                new WMSLayerInfo(scope.map, scope.popup);

                scope.layers = layers;
                scope.wmsLayers = wmsLayers;
                scope.initialLayers = initialLayers;
                scope.$watchCollection('layers', onLayersChange);
                scope.$watchCollection('initialLayers', onInitialLayersChange);
                scope.$watchCollection('wmsLayers', onWMSLayersChange);

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
                                // layersControl.addOverlay(layer, layerName); //Adiciona na lista de camadas
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
                                //debugger;
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
