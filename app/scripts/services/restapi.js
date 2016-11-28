'use strict';

/**
 * @ngdoc service
 * @name operationsApp.RestApi
 * @description
 * # RestApi
 * Service in the operationsApp.
 */
angular.module('sisdrApp')
  .factory('RestApi', function (settings, $resource) {
    var url = settings.server.url + '/:type/:model/:start/:end/';
    return $resource(url, {type: '@type', model: '@model', start: '@start', end: "@end"},
      {
        get: {
          method:'GET',
          params: {
            format:'json'
          },
          isArray: true,
        },
        getObject: {
          method:'GET',
          params: {
            format:'json'
          },
          isArray: false,
        },
        routes: {
          url : settings.server.url + '/:type/routes/:start_date/:end_date/',
          method:'GET',
          params: {
            format:'json'
          },
          isArray: false
        },
        last_position : {
          url : settings.server.url + '/:type/last-position/',
          method : 'GET',
          params : {
            format : 'json'
          },
          isArray : false
        },
        obtain_pass : {
          url : settings.server.url + '/users-api/obtain-pass/',
          method : 'POST',
          params : {
            format : 'json'
          },
          isArray : false
        }
      },
      {stripTrailingSlashes: false}
    );
  });
