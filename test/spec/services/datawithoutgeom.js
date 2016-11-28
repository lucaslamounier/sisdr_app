'use strict';

describe('Service: dataWithoutGeom', function () {

  // load the service's module
  beforeEach(module('operationsApp'));

  // instantiate service
  var dataWithoutGeom;
  beforeEach(inject(function (_dataWithoutGeom_) {
    dataWithoutGeom = _dataWithoutGeom_;
  }));

  it('should do something', function () {
    expect(!!dataWithoutGeom).toBe(true);
  });

});
