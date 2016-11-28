'use strict';

/**
 * @ngdoc function
 * @name operationsApp.controller:LogoutCtrl
 * @description
 * # LogoutCtrl
 * Controller of the operationsApp
 */
angular.module('sisdrApp')
  .controller('LogoutCtrl', function ($scope, $cookies, $http, $location, auth, ACCESS_LEVEL) {

      var headers = {};

      $cookies.put('user_data', '');
      auth.setUser(ACCESS_LEVEL.GUEST, null);
      headers['Authorization'] = 'Token undefined';
      $http.defaults.headers.get = headers;
      $location.path('/');
  });
