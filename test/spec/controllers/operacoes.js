'use strict';

describe('Controller: OperacoesCtrl', function () {

  // load the controller's module
  beforeEach(module('operationsApp'));

  var OperacoesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OperacoesCtrl = $controller('OperacoesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
