'use strict';

describe('Service: RestApi', function () {

  // load the service's module
  beforeEach(module('operationsApp'));

  // instantiate service
  var RestApi;
  beforeEach(inject(function (_RestApi_) {
    RestApi = _RestApi_;
  }));

  it('should do something', function () {
    expect(!!RestApi).toBe(true);
  });

});
