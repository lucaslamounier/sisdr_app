'use strict';

/**
 * @ngdoc service
 * @name sisdrApp.RestApi
 * @description
 * # RestApi
 * Service in the sisdrApp.
 */
angular.module('sisdrApp')
  .factory('RestApi', function (settings, $resource) {
    var url = settings.server.url + '/:type/:model/:start/:end/';
    return $resource(url, {type: '@type', model: '@model', state: '@state', end: "@end"},
      {
        get: {
          method:'GET',
          params: {
            format:'json'
          },
          isArray: true,
        },
        get_dup: {
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
        getPoints: {
          method:'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        },
        getBR: {
          url : settings.server.url + '/:type/:state/',
          method:'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        },
        getDup: {
          url : settings.server.url + '/:type/:pk',
          method:'GET',
          params: {
            format:'json'
          },
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
          url : settings.server_user_auth.url + '/users-api/obtain-pass/',
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
