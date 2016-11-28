'use strict';

describe('Directive: controlSwitch', function () {

  // load the directive's module
  beforeEach(module('operationsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<control-switch></control-switch>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the controlSwitch directive');
  }));
});
