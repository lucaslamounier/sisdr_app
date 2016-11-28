'use strict';

describe('Directive: topBar', function () {

  // load the directive's module
  beforeEach(module('operationsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<top-bar></top-bar>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the topBar directive');
  }));
});
