'use strict';

describe('Controller: EstatisticasCtrl', function () {

  // load the controller's module
  beforeEach(module('operationsApp'));

  var EstatisticasCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EstatisticasCtrl = $controller('EstatisticasCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EstatisticasCtrl.awesomeThings.length).toBe(3);
  });
});
