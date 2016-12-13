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
        /* 'ngCsv',*/
        'ngStorage',
    ])
    .config(function($provide, $routeProvider, authProvider, symbologiesProvider, ACCESS_LEVEL) {

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
            .when('/', {
                templateUrl: 'views/sisdr.html',
                controller: 'sisdrCtrl',
                access: ACCESS_LEVEL.USER
            })
            .when('/dups', {
                templateUrl: 'views/stats.html',
                controller: 'DupCtrl',
                //access: ACCESS_LEVEL.USER
            })
            .when('/dups/detail/:id', {
                templateUrl: 'views/dup_detail.html',
                controller: 'DupDetailCtrl',
                //access: ACCESS_LEVEL.USER
            })
            .when('/projetos', {
                templateUrl: 'views/projetos.html',
                controller: 'ProjetoCtrl',
                //access: ACCESS_LEVEL.USER
            })
            .when('/projetos/detail/:id', {
                templateUrl: 'views/projeto_detail.html',
                controller: 'ProjetoDetailCtrl',
                //access: ACCESS_LEVEL.USER
            })
            .when('/propriedades-lindeiras', {
                templateUrl: 'views/propriedades-lindeiras.html',
                controller: 'PropriedadesLindeirasCtrl',
                //access: ACCESS_LEVEL.USER
            })
            .when('/propriedades-lindeiras/detail/:id', {
                templateUrl: 'views/propriedades-lindeiras_detail.html',
                controller: 'PropriedadesLindeirasDetailCtrl',
                //access: ACCESS_LEVEL.USER
            })
            .otherwise({
                redirectTo: '/'
            });


        // Application settings
        $provide.constant('settings', {
            'server': {
                'url': '//localhost:8000/sisdr-api'
                    //'url': '//siscom.ibama.gov.br/operacoes_api'
            },
            'server_user_auth': {
                'url': '//localhost:8000'
                    //'url': '//siscom.ibama.gov.br/operacoes_api'
            }
        });


        var heliLastIcon = L.divIcon({
            className: 'svg-marker',
            iconSize: null,
            opacity: 1,
            iconAnchor: new L.Point(16, 32),
            popupAnchor: new L.Point(0, -18),
            // html: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="32px" height="32px" id="svg3018" version="1.1" inkscape:version="0.48.5 r10040" sodipodi:docname="Novo documento 2"> <g id="layer1" inkscape:label="Layer 1" inkscape:groupmode="layer"> <path d="M 2.0068137,10.868092 C 1.8973231,25.708619 16.015297,31.593767 16.061534,31.815651 16.206775,31.581861 30.167197,25.734613 30.079833,10.868129 27.192903,-3.4401717 4.8273856,-3.947351 2.0068137,10.8681 z" style="stroke:#eeeeee;stroke-width:0.10903768" id="path1329" inkscape:connector-curvature="0" fill="#111111"/> <g id="g3780" transform="matrix(0.05764698,0,0,0.0521123,-0.89510532,-4.521071)"> <path sodipodi:nodetypes="cc" id="path2872" d="m 265.10872,398.21695 133.2798,0" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:18.70000076;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path sodipodi:nodetypes="cccccccccccccccccccccc" id="path3660" d="m 325.40054,283.74495 c -27.11433,0.84507 -53.34269,9.42465 -80.529,9.87961 -34.92928,2.29399 -76.99751,3.87666 -111.94063,2.33695 1.99656,1.29533 11.54415,0.37374 11.46146,10.50423 2.816,5.21168 -6.14351,12.8561 -2.37094,14.37937 44.41493,2.77835 104.78136,26.58994 152.50411,46.64984 24.34401,8.36603 50.93941,6.82358 76.25,4.625 13.21538,-2.20492 29.92826,-3.26191 37.15625,-16.5 3.20298,-9.11621 -8.6e-4,-19.28648 -3.34375,-27.875 -11.6761,-27.02707 -41.17439,-41.70987 -69.46548,-43.73707 -3.23142,-0.26887 -6.48062,-0.35427 -9.72202,-0.26293 z m 25.96291,11.97167 c 12.0857,1.03859 24.30274,7.05641 32.10105,16.18312 8.62377,8.08029 13.16131,20.04676 14.02395,31.94188 -15.66602,0.52921 -28.81749,-0.0801 -43.71661,-0.0801 -7.73602,-16.05957 -16.47031,-31.19742 -24.12714,-47.29488 7.2289,-0.56234 12.93621,-1.23604 21.71875,-0.75 z m -34.59375,1.72517 c 7.20805,7.01924 17.11979,39.02726 20.93546,47.78885 -12.84377,-0.14361 -32.90884,0.35436 -45.75234,0.19042 -0.13401,-7.95854 -0.61938,-39.77742 -0.75146,-47.73599 8.10431,-0.12441 17.46396,-0.13307 25.56834,-0.24328 z" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:8.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path sodipodi:nodetypes="ccccc" id="path3662" d="m 311.72788,272.31885 c -12.3058,-2.26182 -27.05427,8.72945 -38.93108,13.81425 l 36.4194,2.51168 41.79147,-5.02336 c -8.58846,-4.45605 -26.07283,-13.00453 -39.27979,-11.30257 z" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:3.70000005;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3664" d="m 311.72788,245.31825 -0.62792,30.76812" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:10.39999962;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3666" d="m 156.08241,228.99232 154.38963,14.44217 159.41299,-13.81425 -7.53504,8.79089 -150.62211,8.16297 -148.11042,-6.90713 -7.53505,-10.67465 z" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:5.0999999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" sodipodi:nodetypes="ccccccc" inkscape:connector-curvature="0"/> <path id="path3726" d="m 124.32868,293.75121 c -3.56225,-9.47953 -6.98912,-19.03812 -10.52189,-28.53751 l -6.59375,0.375 0,0 c 4.65512,9.70907 9.08305,19.82866 13.73933,29.53563" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:10.10000038;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3678" d="m 132.4186,323.78079 10.16944,29.18291 c 1.68267,-0.54311 6.53218,0.98878 6.90625,-1.0625 -5.3782,-9.42179 -9.37675,-19.68689 -13.76577,-29.71518" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:10.10000038;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3680" d="m 126.58241,291.30255 c -12.63207,0.0284 -21.2103,15.46427 -14.75279,26.22719 5.63246,11.59712 23.73241,12.38102 30.43823,1.4131 8.08174,-11.83297 -1.22345,-28.58449 -15.68544,-27.64029 z m 0.48045,7.99816 c 8.34686,-0.78819 13.60603,10.54095 7.57423,16.36373 -5.34325,6.46098 -17.01785,2.13193 -16.92897,-6.21765 -0.30203,-5.24668 4.09881,-10.01936 9.35474,-10.14608 z" style="fill:#ffffff;fill-opacity:1;stroke-width:18.70000076;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4" inkscape:connector-curvature="0"/> </g> <path sodipodi:type="arc" style="fill:#ff0000;fill-opacity:0;fill-rule:evenodd;stroke:#ffffff;stroke-width:0.30000001;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:3.4000001;stroke-opacity:1;stroke-dasharray:none" id="path3785" sodipodi:cx="-7.984375" sodipodi:cy="7.46875" sodipodi:rx="3.921875" sodipodi:ry="3.9375" d="m -4.0625,7.46875 a 3.921875,3.9375 0 1 1 -7.84375,0 3.921875,3.9375 0 1 1 7.84375,0 z" transform="matrix(3.3056306,0,0,2.6453812,42.418073,-7.8354386)"/> </g></svg>',
            html: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="32px" height="32px" id="svg3018" version="1.1" inkscape:version="0.48.5 r10040" sodipodi:docname="Novo documento 2"> <g id="layer1" inkscape:label="Layer 1" inkscape:groupmode="layer"> <path d="M 2.0068137,10.868092 C 1.8973231,25.708619 16.015297,31.593767 16.061534,31.815651 16.206775,31.581861 30.167197,25.734613 30.079833,10.868129 27.192903,-3.4401717 4.8273856,-3.947351 2.0068137,10.8681 z" style="stroke:#eeeeee;stroke-width:0.10903768" id="path1329" inkscape:connector-curvature="0" fill="#353535"/> <g id="g3780" transform="matrix(0.05764698,0,0,0.0521123,-0.89510532,-4.521071)"> <path sodipodi:nodetypes="cc" id="path2872" d="m 265.10872,398.21695 133.2798,0" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:18.70000076;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path sodipodi:nodetypes="cccccccccccccccccccccc" id="path3660" d="m 325.40054,283.74495 c -27.11433,0.84507 -53.34269,9.42465 -80.529,9.87961 -34.92928,2.29399 -76.99751,3.87666 -111.94063,2.33695 1.99656,1.29533 11.54415,0.37374 11.46146,10.50423 2.816,5.21168 -6.14351,12.8561 -2.37094,14.37937 44.41493,2.77835 104.78136,26.58994 152.50411,46.64984 24.34401,8.36603 50.93941,6.82358 76.25,4.625 13.21538,-2.20492 29.92826,-3.26191 37.15625,-16.5 3.20298,-9.11621 -8.6e-4,-19.28648 -3.34375,-27.875 -11.6761,-27.02707 -41.17439,-41.70987 -69.46548,-43.73707 -3.23142,-0.26887 -6.48062,-0.35427 -9.72202,-0.26293 z m 25.96291,11.97167 c 12.0857,1.03859 24.30274,7.05641 32.10105,16.18312 8.62377,8.08029 13.16131,20.04676 14.02395,31.94188 -15.66602,0.52921 -28.81749,-0.0801 -43.71661,-0.0801 -7.73602,-16.05957 -16.47031,-31.19742 -24.12714,-47.29488 7.2289,-0.56234 12.93621,-1.23604 21.71875,-0.75 z m -34.59375,1.72517 c 7.20805,7.01924 17.11979,39.02726 20.93546,47.78885 -12.84377,-0.14361 -32.90884,0.35436 -45.75234,0.19042 -0.13401,-7.95854 -0.61938,-39.77742 -0.75146,-47.73599 8.10431,-0.12441 17.46396,-0.13307 25.56834,-0.24328 z" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:8.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path sodipodi:nodetypes="ccccc" id="path3662" d="m 311.72788,272.31885 c -12.3058,-2.26182 -27.05427,8.72945 -38.93108,13.81425 l 36.4194,2.51168 41.79147,-5.02336 c -8.58846,-4.45605 -26.07283,-13.00453 -39.27979,-11.30257 z" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:3.70000005;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3664" d="m 311.72788,245.31825 -0.62792,30.76812" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:10.39999962;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3666" d="m 156.08241,228.99232 154.38963,14.44217 159.41299,-13.81425 -7.53504,8.79089 -150.62211,8.16297 -148.11042,-6.90713 -7.53505,-10.67465 z" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:5.0999999;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" sodipodi:nodetypes="ccccccc" inkscape:connector-curvature="0"/> <path id="path3726" d="m 124.32868,293.75121 c -3.56225,-9.47953 -6.98912,-19.03812 -10.52189,-28.53751 l -6.59375,0.375 0,0 c 4.65512,9.70907 9.08305,19.82866 13.73933,29.53563" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:10.10000038;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3678" d="m 132.4186,323.78079 10.16944,29.18291 c 1.68267,-0.54311 6.53218,0.98878 6.90625,-1.0625 -5.3782,-9.42179 -9.37675,-19.68689 -13.76577,-29.71518" style="fill:#ffffff;fill-opacity:1;stroke:#ffffff;stroke-width:10.10000038;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" inkscape:connector-curvature="0"/> <path id="path3680" d="m 126.58241,291.30255 c -12.63207,0.0284 -21.2103,15.46427 -14.75279,26.22719 5.63246,11.59712 23.73241,12.38102 30.43823,1.4131 8.08174,-11.83297 -1.22345,-28.58449 -15.68544,-27.64029 z m 0.48045,7.99816 c 8.34686,-0.78819 13.60603,10.54095 7.57423,16.36373 -5.34325,6.46098 -17.01785,2.13193 -16.92897,-6.21765 -0.30203,-5.24668 4.09881,-10.01936 9.35474,-10.14608 z" style="fill:#ffffff;fill-opacity:1;stroke-width:18.70000076;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4" inkscape:connector-curvature="0"/> </g> <path sodipodi:type="arc" style="fill:#ff0000;fill-opacity:0;fill-rule:evenodd;stroke:#ffffff;stroke-width:0.30000001;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:3.4000001;stroke-opacity:1;stroke-dasharray:none" id="path3785" sodipodi:cx="-7.984375" sodipodi:cy="7.46875" sodipodi:rx="3.921875" sodipodi:ry="3.9375" d="m -4.0625,7.46875 a 3.921875,3.9375 0 1 1 -7.84375,0 3.921875,3.9375 0 1 1 7.84375,0 z" transform="matrix(3.3056306,0,0,2.6453812,42.418073,-7.8354386)"/> </g></svg>',

        });
        var carLastIcon = L.icon({
            iconUrl: 'images/icons/car-location.png',
            iconSize: [32, 38],
            // className: 'svg-marker',
            // iconSize: null,
            // opacity: 1,
            iconAnchor: new L.Point(16, 32),
            popupAnchor: new L.Point(0, -19),
            // // html: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="32px" height="32px" id="svg3018" version="1.1" inkscape:version="0.48.5 r10040" sodipodi:docname="car.svg" enable-background="new"> <defs id="defs3020"> <filter inkscape:collect="always" id="filter3093"> <feBlend inkscape:collect="always" mode="darken" in2="BackgroundImage" id="feBlend3095"/> </filter> </defs> <g id="layer1" inkscape:label="Layer 1" inkscape:groupmode="layer" style="opacity:1;filter:url(#filter3093)"> <path d="m 2.0068137,10.868092 c -0.2026255,3.344876 0.2880146,6.429213 1.6832141,8.508584 5.6294997,8.390068 12.3354122,12.265766 12.3715062,12.438975 0.113297,-0.182371 5.809487,-3.626067 12.33381,-12.41108 1.689098,-2.274374 1.703704,-5.26676 1.684489,-8.536442 C 29.202226,-2.9266781 3.6907409,-4.9513553 2.0068137,10.868092 z" style="stroke:#eeeeee;stroke-width:0.10903768" id="path1329" fill="darkred"/> <path sodipodi:type="arc" style="fill:#ff0000;fill-opacity:0;fill-rule:evenodd;stroke:#ffffff;stroke-width:0.30000000999999998;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:3.40000010000000019;stroke-opacity:1;stroke-dasharray:none" id="path3785" sodipodi:cx="-7.984375" sodipodi:cy="7.46875" sodipodi:rx="3.921875" sodipodi:ry="3.9375" d="m -4.0625,7.46875 a 3.921875,3.9375 0 1 1 -7.84375,0 3.921875,3.9375 0 1 1 7.84375,0 z" transform="matrix(3.3056306,0,0,2.6453812,42.418073,-7.8354386)"/> <path inkscape:connector-curvature="0" style="fill:#ffffff;stroke:none" d="m 12.252287,7.0909246 c -1.080602,0 -1.653838,0.3997011 -1.918479,0.8675663 L 8.9290188,10.41608 C 8.3721366,10.46444 7.384951,10.907348 7.384951,11.746347 l 0,3.125262 1.3673477,0 0,0.999476 c 0,1.22965 2.5684543,1.215168 2.5684543,0 l 0,-0.999476 4.620228,0 0.0015,0 4.620224,0 0,0.999476 c 0,1.215168 2.568444,1.22965 2.568459,0 l 0,-0.999476 1.367345,0 0,-3.125262 c 0,-0.838999 -0.987178,-1.281885 -1.544071,-1.330267 L 21.548172,7.9584909 C 21.283532,7.4906257 20.710302,7.0909246 19.62969,7.0909246 l -1.985869,0 -3.381682,0 -2.009832,0 z m -0.01648,0.8949624 3.702173,0 0.003,0 0.0015,0 3.703666,0 c 0.463095,0.00285 0.661432,0.1991326 0.79375,0.4708177 l 1.058832,1.9340093 -5.556248,0 -0.0015,0 -0.003,0 -5.554756,0 1.058833,-1.9340093 c 0.132327,-0.271663 0.330607,-0.4678984 0.79375,-0.4708177 z m -2.158101,3.345451 c 0.655271,0 1.186132,0.37042 1.186132,0.827989 0,0.457605 -0.530861,0.829008 -1.186132,0.829008 -0.6552252,0 -1.1861331,-0.371403 -1.1861331,-0.829008 0,-0.457569 0.5309079,-0.827989 1.1861331,-0.827989 z m 11.728035,0 c 0.655274,0 1.186138,0.37042 1.186134,0.827989 0,0.457605 -0.53086,0.829008 -1.186134,0.829008 -0.655224,0 -1.187631,-0.371403 -1.187631,-0.829008 0,-0.457569 0.532407,-0.827989 1.187631,-0.827989 z" id="path2301"/> </g></svg>',
            // html: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   enable-background="new"   version="1.1"   id="svg3018"   height="32px"   width="32px">  <metadata     id="metadata12">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />      </cc:Work>    </rdf:RDF>  </metadata>  <defs     id="defs3020">    <filter       id="filter3093">      <feBlend         id="feBlend3095"         in2="BackgroundImage"         mode="darken" />    </filter>  </defs>  <g     style="opacity:1;filter:url(#filter3093)"     id="layer1">    <path       fill="#3D64D4"       id="path1329"       style="stroke:#eeeeee;stroke-width:0.10903768"       d="m 2.0068137,10.868092 c -0.2026255,3.344876 0.2880146,6.429213 1.6832141,8.508584 5.6294997,8.390068 12.3354122,12.265766 12.3715062,12.438975 0.113297,-0.182371 5.809487,-3.626067 12.33381,-12.41108 1.689098,-2.274374 1.703704,-5.26676 1.684489,-8.536442 C 29.202226,-2.9266781 3.6907409,-4.9513553 2.0068137,10.868092 z" />    <path       transform="matrix(3.3056306,0,0,2.6453812,42.418073,-7.8354386)"       d="m -4.0625,7.46875 a 3.921875,3.9375 0 1 1 -7.84375,0 3.921875,3.9375 0 1 1 7.84375,0 z"       id="path3785"       style="fill:#ff0000;fill-opacity:0;fill-rule:evenodd;stroke:#ffffff;stroke-width:0.30000000999999998;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:3.40000010000000019;stroke-opacity:1;stroke-dasharray:none" />    <path       id="path2301"       d="m 12.252287,7.0909246 c -1.080602,0 -1.653838,0.3997011 -1.918479,0.8675663 L 8.9290188,10.41608 C 8.3721366,10.46444 7.384951,10.907348 7.384951,11.746347 l 0,3.125262 1.3673477,0 0,0.999476 c 0,1.22965 2.5684543,1.215168 2.5684543,0 l 0,-0.999476 4.620228,0 0.0015,0 4.620224,0 0,0.999476 c 0,1.215168 2.568444,1.22965 2.568459,0 l 0,-0.999476 1.367345,0 0,-3.125262 c 0,-0.838999 -0.987178,-1.281885 -1.544071,-1.330267 L 21.548172,7.9584909 C 21.283532,7.4906257 20.710302,7.0909246 19.62969,7.0909246 l -1.985869,0 -3.381682,0 -2.009832,0 z m -0.01648,0.8949624 3.702173,0 0.003,0 0.0015,0 3.703666,0 c 0.463095,0.00285 0.661432,0.1991326 0.79375,0.4708177 l 1.058832,1.9340093 -5.556248,0 -0.0015,0 -0.003,0 -5.554756,0 1.058833,-1.9340093 c 0.132327,-0.271663 0.330607,-0.4678984 0.79375,-0.4708177 z m -2.158101,3.345451 c 0.655271,0 1.186132,0.37042 1.186132,0.827989 0,0.457605 -0.530861,0.829008 -1.186132,0.829008 -0.6552252,0 -1.1861331,-0.371403 -1.1861331,-0.829008 0,-0.457569 0.5309079,-0.827989 1.1861331,-0.827989 z m 11.728035,0 c 0.655274,0 1.186138,0.37042 1.186134,0.827989 0,0.457605 -0.53086,0.829008 -1.186134,0.829008 -0.655224,0 -1.187631,-0.371403 -1.187631,-0.829008 0,-0.457569 0.532407,-0.827989 1.187631,-0.827989 z" style="fill:#ffffff;stroke:none" /></g></svg>',
        });

        symbologiesProvider
            .register('vehicles-pos', L.marker, {
                icon: carLastIcon,
            })
            .register('helicopters-pos', L.marker, {
                icon: heliLastIcon,
            })
            .register('vehicles-search', L.circleMarker, {
                radius: 7,
                color: "#2D4999",
                weight: 1,
                opacity: 1,
                fillColor: "#3D64D4",
                fillOpacity: 0.7,
            })
            .register('vehicles-multi-line', L.multiPolyline, {
                color: "#2D4999",
                weight: 3,
                opacity: 0.5,
                fillColor: "#3D64D4",
                fillOpacity: 0.5,
            })
            .register('helicopters-multi-line', L.multiPolyline, {
                color: "#000",
                weight: 3,
                opacity: 0.5,
                fillColor: "#000",
                fillOpacity: 0.5,
            })
            .register('helicopters-search', L.circleMarker, {
                radius: 7,
                color: "#000",
                weight: 0.5,
                opacity: 0.5,
                fillColor: "#000",
                fillOpacity: 0.5,
            })
            .register('infractions-last', L.circleMarker, {
                radius: 7,
                color: "#8B0000",
                weight: 1,
                opacity: 1,
                fillColor: "#8B0000",
                fillOpacity: 0.5,
            })
            .register('embargos-last', L.circleMarker, {
                radius: 7,
                weight: 1,
                opacity: 1,
                fillColor: '#A0522D',
                fillOpacity: 0.5,
            })
            .register('embargos-search', L.circleMarker, {
                radius: 7,
                weight: 1,
                opacity: 1,
                fillColor: '#774F38',
                fillOpacity: 0.5,
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
                    html += "<b>" + key + "</b>: " + (value ? value : '') + "<br/>";
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