'use strict';

/**
 * @ngdoc directive
 * @name sisdrApp.directive:sideNav
 * @description
 * # sideNav
 */
angular.module('sisdrApp')
  .directive('sideNav', function (RestApi, $q) {
    return {
      templateUrl: 'views/partials/sidenav.html',
      restrict: 'E',
      controller : function ($rootScope, $mdSidenav) {
        function toggleNav(navID){
          $mdSidenav(navID).toggle();
        }
        $rootScope.toggleNav = toggleNav;
      }
    };
  });
