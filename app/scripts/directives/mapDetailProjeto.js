'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:map-mini
 * @description
 * # map
 */
angular.module('sisdrApp')
    .directive('mapdetailprojeto', function() {
        return {
            template: '<div id="mapdetailprojeto" control-switch resizable"></div>',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                var date,
                    mapOSM,
                    googleSat,
                    googleStreets,
                    googleHybrid,
                    googleTerrain,
                    mapPositron,
                    mapDark,
                    OpenStreetMap_city,
                    OpenMapSurfer_Roads,
                    Esri_WorldImagery,
                    HikeBike_HikeBike,
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

                googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                });
                googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                });

                googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                });

                OpenStreetMap_city = L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
                    maxZoom: 20,
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                });

                OpenMapSurfer_Roads = L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
                    maxZoom: 19,
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                });

                Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    maxZoom: 17,
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                });

                HikeBike_HikeBike = L.tileLayer('http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                });

                if (date.getHours() >= 18 || date.getHours() <= 5) {
                    scope.map = L.map('mapdetailprojeto', {
                        layers: [mapDark]
                    });
                } else {
                    scope.map = L.map('mapdetailprojeto', {
                        layers: [mapOSM]
                    });
                }
                //scope.map.setView([-16, -48], 4);
                scope.map.setView([-15, -52], 4);

                scope.control = new L.control.switch({
                    "OpenStreetMap": {
                        layer: mapOSM
                    },
                    "OpenStreetMap City": {
                        layer: OpenStreetMap_city
                    },
                    "OpenStreetMap Roads": {
                        layer: OpenMapSurfer_Roads
                    },
                    "OpenStreetMap Bike": {
                        layer: HikeBike_HikeBike
                    },
                    "Esri World Imagery": {
                        layer: Esri_WorldImagery
                    },
                    "CartoDB Positron": {
                        layer: mapPositron
                    },
                    "CartoDB Dark": {
                        layer: mapDark
                    },
                    "Google Satellite": {
                        layer: googleSat
                    },
                    "Google Streets": {
                        layer: googleStreets
                    },
                    "Google Hybrid": {
                        layer: googleHybrid
                    },
                    "Google Terrain": {
                        layer: googleTerrain
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