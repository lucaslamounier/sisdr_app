'use strict';

/**
 * @ngdoc service
 * @name operationsApp.formData
 * @description
 * # formData
 * Service in the operationsApp.
 */
 angular.module('sisdrApp')
 .service('formData', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var current,
    years = [],
    startYear = 1988,
    endYear = (new Date()).getFullYear();

    while(startYear <= endYear){
      years.unshift(startYear);
      startYear++;
    }

    var anos = years.map(function(data){
        return data = {
            value: data,
            key: data
        }
    });

    var data = {

      anos: anos,

      meses: [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro"
      ],

      estados : [
          { nome: 'Acre', regiao: 'Norte', sigla: 'AC', codigo: 12},
          { nome: 'Amapá', regiao: 'Norte', sigla: 'AP', codigo: 16},
          { nome: 'Amazonas', regiao: 'Norte', sigla: 'AM', codigo: 13},
          { nome: 'Pará', regiao: 'Norte', sigla: 'PA', codigo: 15},
          { nome: 'Rondônia', regiao: 'Norte', sigla: 'RO', codigo: 11},
          { nome: 'Roraima', regiao: 'Norte', sigla: 'RR', codigo: 14},
          { nome: 'Tocantins', regiao: 'Norte', sigla: 'TO', codigo: 17},
          { nome: 'Alagoas', regiao: 'Nordeste', sigla: 'AL', codigo: 27},
          { nome: 'Bahia', regiao: 'Nordeste', sigla: 'BA', codigo: 29},
          { nome: 'Ceará', regiao: 'Nordeste', sigla: 'CE', codigo: 23},
          { nome: 'Maranhão', regiao: 'Nordeste', sigla: 'MA', codigo: 21},
          { nome: 'Paraíba', regiao: 'Nordeste', sigla: 'PB', codigo: 25},
          { nome: 'Pernambuco', regiao: 'Nordeste', sigla: 'PE', codigo: 26},
          { nome: 'Piauí', regiao: 'Nordeste', sigla: 'PI', codigo: 22},
          { nome: 'Rio Grande do Norte', regiao: 'Nordeste', sigla: 'RN', codigo: 24},
          { nome: 'Sergipe', regiao: 'Nordeste', sigla: 'SE', codigo: 28},
          { nome: 'Distrito Federal', regiao: 'Centro-Oeste', sigla: 'DF', codigo: 53},
          { nome: 'Goiás', regiao: 'Centro-Oeste', sigla: 'GO', codigo: 52},
          { nome: 'Mato Grosso', regiao: 'Centro-Oeste', sigla: 'MT', codigo: 51},
          { nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', sigla: 'MS', codigo: 50},
          { nome: 'Espírito Santo', regiao: 'Sudeste', sigla: 'ES', codigo: 32},
          { nome: 'Minas Gerais', regiao: 'Sudeste', sigla: 'MG', codigo: 31},
          { nome: 'Rio de Janeiro', regiao: 'Sudeste', sigla: 'RJ', codigo: 33},
          { nome: 'São Paulo', regiao: 'Sudeste', sigla: 'SP', codigo: 35},
          { nome: 'Paraná', regiao: 'Sul', sigla: 'PR', codigo: 41},
          { nome: 'Rio grande do Sul', regiao: 'Sul', sigla: 'RS', codigo: 43},
          { nome: 'Santa Catarina', regiao: 'Sul', sigla: 'SC', codigo: 42},
      ],

      regioes: [
          { nome: 'Centro-Oeste'},
          { nome: 'Norte'},
          { nome: 'Nordeste'},
          { nome: 'Sul'},
          { nome: 'Sudeste'}
      ]

  };

  return data;

});
