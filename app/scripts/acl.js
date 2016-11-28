'use strict';

/**
 * @ngdoc overview
 * @name acl
 * @description
 * Access Control List
 *
 * Módulo para gerenciamento do controle de acesso a funcionalidades e rotas da
 * aplicação.
 * Para definir um nível de acesso a determinada rota adicione a propriedade
 * "access" ao configurar as rotas em '$routeProvider'. Exemplo:
 *
 * $routeProvider
 *  .when('/application', {
 *    templateUrl: 'views/operacoes.html',
 *    controller: 'OperacoesCtrl',
 *    access : ACCESS_LEVEL.USER //
 *  })
 *
 */

angular
  .module('ACL', [])
  .constant('ACCESS_LEVEL', {
    /**
     * Usuário não autenticado.
     * Nível padrão.
     */
    GUEST : 0,

    /**
     * Usuário autenticado.
     */
    USER : 1
  })
  .provider('auth', function (ACCESS_LEVEL) {

    var redirectTo = '/';

    /**
     * Define a rota a ser redirecionada se o nível atual não for autorizado a
     * acessar a 'rota' solicitada. O ideal é o apontar para a tela de login.
     */
    this.setRedirect = function (route) {
      redirectTo = route;
    }

    this.$get = function () {

      var auth = {};
      var currentUser;
      var currentLevel = ACCESS_LEVEL.GUEST;

      /**
       * Retorna o 'path' para redirecionamentos.
       * @private
       */
      auth.$$getRedirectPath = function () {
        return redirectTo;
      }
      /**
       * Verifica se o usuário possui autorização ao nível (level) especificado.
       * Os níveis de acesso são listados na constante 'ACCESS_LEVEL'.
       * @param level {Number} Nível de acesso necessário.
       */
      auth.authorize = function (level) {
        return level === ACCESS_LEVEL.GUEST ? true : Boolean(currentLevel & level);
      }

      /**
       * Define o nível atual.
       * @param level {Number} Nível de acesso.
       */
      auth.setUser = function (level, user) {
        currentLevel = level;
        currentUser = user;
      }

      /**
       * Retorna o nível atual.
       */
      auth.getLevel = function () {
        return currentLevel;
      }

      /**
       * Retorna o usuário atual
       */
      auth.getUser = function () {
        return currentUser;
      }

      /**
       * Verifica se o usuário foi definido em um nível diferente do padrão
       * (ACCESS_LEVEL.GUEST).
       */
      auth.isAuthenticated = function () {
        return currentLevel !== ACCESS_LEVEL.GUEST;
      }

      return auth;
    }
  })
  .run(function ($rootScope, $location, $route, auth, ACCESS_LEVEL) {
    var path = $location.path();
    var access;

    if($route.routes.hasOwnProperty(path)){
      access = $route.routes[path].access;
      if(typeof access != 'undefined' && !auth.authorize(access)){
        $location.path(auth.$$getRedirectPath());
      }
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) {

      if(typeof next.access == 'undefined'){
        next.access = ACCESS_LEVEL.GUEST
      }

      if(!auth.authorize(next.access)){
        $location.path(auth.$$getRedirectPath());
      }
    });
  });
