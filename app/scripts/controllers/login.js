'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
    .controller('LoginCtrl', function($rootScope, $scope, RestApi, auth, $location, $http, $cookies, ACCESS_LEVEL, $localStorage) {

        var user_data = $cookies.get('user_data');

        if (user_data) {
            try {
                user_data = angular.fromJson(user_data);
                initApplication(user_data, ACCESS_LEVEL.USER);
            } catch (error) {
                $location.path('/logout');
            }
        }

        /**
         * Realiza a autenticação do usuário por meio de 'username' e 'password'.
         * @param {String} username Nome do usuário.
         * @param {String} password Senha do usuário.
         */
        $scope.doLogin = function(username, password) {

            var request = RestApi.obtain_pass({
                username: username,
                password: password
            });

            request.$promise.then(obtainPassResult, obtainPassError)

            function obtainPassResult(user_data) {
                console.log('SUCESS');
                if (user_data && user_data.permited) {
                    user_data.username = username;
                    user_data.password = password;
                    $cookies.put('user_data', angular.toJson(user_data));
                    initApplication(user_data, ACCESS_LEVEL.USER);
                } else {
                    showMessage('Usuário não possui permissão', 'danger');
                }
            }

            function obtainPassError(error) {
                console.log('FAILED');
                if (error.status == 400) {
                    showMessage('Usuário não possui permissão', 'danger')
                } else {
                    showMessage('Falha na requisição. Consulte o administrador do sistema', 'danger');
                }
            }
        }

        /**
         * Define as pré configurações referentes a autenticação
         * do usuário e inicializa a aplicação.
         * @param {Object} Informações do usuário.
         * @param {Number} Nível de acesso dado ao usuário.
         */
        function initApplication(user_data, level) {
            var headers = {};
            $localStorage = {};
            auth.setUser(level, user_data);
            headers['Authorization'] = 'Token ' + user_data.token;
            $http.defaults.headers.get = headers;
            $location.path('#/');
            console.log('pass in initApplication');
        }

        /**
         * Apresenta a mensagem ao usuário.
         * @param {String} message Mensagem que deve ser apresentada.
         * @param {String} cls Classe do tipo da mensagem. (Opções: success,
         * warning, danger, alert)
         */
        function showMessage(message, cls) {
            cls = cls ? cls : 'success'
            $scope.message = message;
            $scope.message_cls = 'alert-' + cls;
        }

    });