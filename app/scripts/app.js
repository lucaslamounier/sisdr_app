'use strict';

/**
 * @ngdoc overview
 * @name sisdrApp
 * @description
 * # sisdrApp
 *
 * Main module of the application.
 */
angular
    .module('sisdrApp', [
        'ACL',
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngTouch',
        'ngSanitize',
        'ngMaterial',
        'ui.bootstrap',
    ])
    .config(function($provide, $routeProvider, authProvider, ACCESS_LEVEL) {

        authProvider.setRedirect('/login');

        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/logout', {
                templateUrl: 'views/logout.html',
                controller: 'LogoutCtrl'
            })
            .when('/sobre', {
                templateUrl: 'views/sobre.html',
            })
            .when('/manual', {
                templateUrl: 'views/manual.html',
            })
            .when('/', {
                templateUrl: 'views/sisdr.html',
                controller: 'sisdrCtrl',
                access: ACCESS_LEVEL.USER
            })
            .when('/dups', {
                templateUrl: 'views/dups.html',
                controller: 'DupCtrl',
            })
            .when('/dups/detail/:id', {
                templateUrl: 'views/dup_detail.html',
                controller: 'DupDetailCtrl',
            })
            .when('/estatistica', {
                templateUrl: 'views/estatistica.html',
                controller: 'estatisticaCtrl',
            })
            .when('/profaixa', {
                templateUrl: 'views/profaixa.html',
                controller: 'ProfaixaCtrl',
            })
            .when('/profaixa/detail/:id', {
                templateUrl: 'views/profaixa_detail.html',
                controller: 'ProfaixaDetailCtrl',
            })
            .when('/projetos', {
                templateUrl: 'views/projetos.html',
                controller: 'ProjetoCtrl',
            })
            .when('/projetos/detail/:id', {
                templateUrl: 'views/projeto_detail.html',
                controller: 'ProjetoDetailCtrl',
            })
            .when('/propriedades-lindeiras', {
                templateUrl: 'views/propriedades-lindeiras.html',
                controller: 'PropriedadesLindeirasCtrl',
            })
            .when('/propriedades-lindeiras/detail/:id', {
                templateUrl: 'views/propriedades-lindeiras_detail.html',
                controller: 'PropriedadesLindeirasDetailCtrl',
            })
            .otherwise({
                redirectTo: '/'
            });


        // Application settings
        $provide.constant('settings', {
            'server': {
                //'url': '://localhost:8000/sisdr-api'
                'url': '//10.100.11.139/sisdr-api'
            },
            'server_user_auth': {
                //'url': '//localhost:8000'
                'url': '//10.100.11.139'
            }
        });


        $provide.constant('GISHelper', {

            invertLatLng: function(latlng) {
                return latlng;
            },

            createHTMLPopup: function(data) {
                var data_sep = '/';
                var hora_sep = ':'
                var html = '';
                var dataRegex = /^(\d{4}).(\d{2}).(\d{2})(?:.(\d{2}).(\d{2}).(\d{2}))?/

                angular.forEach(data, function(value, key) {

                    if (dataRegex.test(value)) {
                        var groups = dataRegex.exec(value);
                        value = groups[3];
                        value += data_sep + groups[2];
                        value += data_sep + groups[1];
                        if (groups[4]) {
                            value += ' - ';
                            value += groups[4];
                            value += hora_sep + groups[5];
                            value += hora_sep + groups[6];
                        }
                    }
                    if (key == ' ') {
                        html += "</b>" + (value ? value : '') + "<br/>";
                    } else {
                        html += "<b>" + key + "</b>: " + (value ? value : '') + "<br/>";
                    }

                })
                return html;
            },

            calculatePeriod: function(start_date, monthPeriod) {
                var period;
                if (typeof monthPeriod == 'undefined') {
                    monthPeriod = 2;
                }
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(start_date)) {
                    var date = start_date.split('/');
                    var now = new Date();
                    var min_date = new Date(date[2], date[1] - 1, date[0]);
                    var max_date = new Date(date[2], date[1] - 1, date[0]);

                    min_date.setDate(min_date.getDate() + 1);
                    max_date.setDate(max_date.getDate() + (monthPeriod * 30));
                    max_date = max_date.getTime() > now.getTime() ? now : max_date;
                    period = [min_date, max_date];
                }
                return period;
            },

            traceRoute: function(polyline, symbologies, style) {
                var timer;
                var marker;
                var timeout = 1500;
                var index = 0;
                var latlngs = polyline.getLatLngs();

                marker = symbologies.make(latlngs[index], style);

                function play() {
                    if (latlngs.length - 1 == index)
                        index = 0;
                    marker.setLatLng(latlngs[index]);
                    clearTimeout(timer);
                    timer = setTimeout(play, timeout);
                    index += 1;
                }

                return {

                    marker: marker,

                    start: function() {
                        index = 0;
                        clearTimeout(timer);
                        timer = setTimeout(play, timeout);
                        play();
                    },

                    stop: function() {
                        clearTimeout(timer);
                    }
                }
            },

            embargoStyle: function(feature) {
                var style = {
                    weight: 1,
                    opacity: 0.6,
                    color: '#8B4513',
                    dashArray: '3',
                    fillOpacity: 0.6,
                    fillColor: '#A0522D'
                };
                if (feature.geometry.type.toLowerCase() == 'point') {
                    style.weight = 0;
                }
                return style;
            },

            embargoSearchStyle: function(feature) {
                var style = {
                    weight: 1,
                    opacity: 0.6,
                    color: '#774F38',
                    dashArray: '3',
                    fillOpacity: 0.6,
                    fillColor: '#774F38'
                };
                if (feature.geometry.type.toLowerCase() == 'point') {
                    style.weight = 0;
                }
                return style;
            },


            doMultiPolyline: function(features, getDate, getPoint, doMultiPolyline) {

                var date, point, paths, polyline, polylines, pathMap,
                    pathIndex, path;

                pathMap = {};
                pathIndex = -1;
                paths = [];


                features.map(function(feature) {
                    try {
                        date = String(getDate(feature));
                        point = getPoint(feature);

                        if (pathMap.hasOwnProperty(date)) {
                            path = pathMap[date]
                            path.push(point);
                        } else {
                            pathIndex += 1;
                            paths[pathIndex] = [point];
                            pathMap[date] = paths[pathIndex];
                        }
                    } catch (error) {
                        console.error(feature, error);
                    }
                });

                polyline = doMultiPolyline(paths);

                return polyline;
            },

            dataWithoutGeom: function(object) {
                var size = 0,
                    i = 0;
                while (i < object.length) {
                    if (!object[i].geometry) {
                        size = 1;
                        break;
                    }
                    i++;
                }
                return size;
            },

            formatDate: function(date, separator) {
                separator = (typeof separator !== 'undefined' ? separator : '-');
                var result;
                if (date instanceof Date) {
                    result = date.getDate() + separator + (date.getMonth() + 1) + separator + date.getFullYear();
                } else {
                    date = date.split('/');
                    result = date[2] + separator + date[1] + separator + date[0];
                }
                return result;
            },

            formatData: function(data) {
                if (data.geometry) {
                    data.properties['latLng'] = data.geometry.coordinates;
                } else {
                    data.properties['latLng'] = null;
                }
                return data.properties;
            },

            embargosFormatData: function(data) {
                if (data.geometry) {
                    data.properties['Possui_geometria'] = 'Sim';
                    data.properties['latLng'] = data.geometry.coordinates;
                } else {
                    data.properties['Possui_geometria'] = 'Não';
                    data.properties['latLng'] = null;
                }
                return data.properties;
            },

            csvReturn: function(data, type, model) {
                var csvTitle = [],
                    csvKeys = [],
                    dataReturn = {};

                angular.forEach(data[0].properties, function(value, key) {
                    csvTitle.push(key);
                    csvKeys.push(key);
                })

                csvTitle.unshift('#');

                if (model) {
                    csvTitle.push('Possui_geometria');
                    csvKeys.push('Possui_geometria');
                }

                csvTitle.push(type);
                csvKeys.push(type);

                return dataReturn = {
                    titles: csvTitle,
                    keys: csvKeys
                }
            },
        });
    });