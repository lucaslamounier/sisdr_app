'use strict';

describe('Service: formData', function () {

  // load the service's module
  beforeEach(module('operationsApp'));

  // instantiate service
  var formData;
  beforeEach(inject(function (_formData_) {
    formData = _formData_;
  }));

  it('Verifica se existe um objeto', function () {
    expect(!!formData).toBe(true);
  });

  // it('Verifica quantidade de dados em objetos', inject(function ($compile){
  //   expect(formData.lenght).toBe(2);
  //   expect(formData.estados.lenght).toBe(27);
  //   expect(formData.regioes.lenght).toBe(5);
  // }))

});
