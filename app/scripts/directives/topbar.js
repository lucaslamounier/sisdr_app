'use strict';

/**
 * @ngdoc directive
 * @name operationsApp.directive:topBar
 * @description
 * # topBar
 */
angular.module('sisdrApp')
    .directive('topBar', function() {
        return {
            templateUrl: 'views/partials/topbar.html',
            restrict: 'EA',
            controller: function($scope, $mdSidenav, auth, $location) {

                var user = auth.getUser();
                if (user) {
                    $scope.username = user.name;
                }

                $scope.openNav = openNav

                $scope.$watch(auth.isAuthenticated, function(value) {
                    $scope.isAuthenticated = value;
                    $scope.username = '';

                    if (value) {
                        user = auth.getUser();
                        $scope.username = user.name;
                    }
                })

                $scope.logout = function() {
                    $location.path('/logout');
                }

                function openNav(navID) {
                    $mdSidenav(navID)
                        .toggle();
                }
            }
        }
    });