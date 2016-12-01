'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:sisdrCtrl
 * @description
 * # sisdrCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
  .controller('sisdrCtrl', function ($scope, $rootScope, RestApi, $q, symbologies, GISHelper, formData, $timeout, auth) {


    var profaixaLayerName = 'Profaixa';
    var RodoviaLayerName = 'Rodovias';
    var PropriedadesLindeirasLayerName = 'Propriedades Lindeiras';

    var user = auth.getUser();
    var username = user.username;
    var password = user.password;

    /**
     * Remoção de overlayers adicionadas ao mapa, chamada por $timeout
    */
    function removeLayers(){
      $scope.map.setView([-16, -48], 4);
    }

    function propertiesProfaixa(feature, layer){
      if(feature.properties){
          var properties = {
                "BR": feature.properties.vl_br, 
                "Municipíos": feature.properties.li_municipio, 
                "UF": feature.properties.sg_uf, 
                "Tipo de Trecho":feature.properties.sg_tipo_trecho_display, 
                "Código rodovia": feature.properties.vl_codigo_rodovia, 
                "KM Inicial": feature.properties.vl_km_inicial, 
                "KM Final": feature.properties.vl_km_final
          }
          layer.bindPopup(GISHelper.createHTMLPopup(properties));
      }
    }

    function propertiesPropLindeira(feature, layer){
      if(feature.properties){
          var properties = {
                'Município': feature.properties.nm_municipio, 
                'UF': feature.properties.sg_uf,
                'Propriedade': feature.properties.nm_propriedade, 
                'Proprietário': feature.properties.nm_proprietario
          }
          layer.bindPopup(GISHelper.createHTMLPopup(properties));
      }
    }

    function propertiesRodovia(feature, layer){
      if(feature.properties){
          var properties = {
                'BR': feature.properties.vl_br, 
                'UF': feature.properties.sg_uf, 
                'Início': feature.properties.ds_local_i, 
                'Fim': feature.properties.ds_local_f, 
                'KM Início': feature.properties.vl_km_inic, 
                'KM Fim': feature.properties.vl_km_fina, 
                'Jurisdição': feature.properties.ds_jurisdi, 
                'Situação': feature.properties.ds_superfi
          };
          layer.bindPopup(GISHelper.createHTMLPopup(properties));
      }
    }

    /**
     * Resultado da requisição
     * @param data
    */
    function getColor(d) {
        return d > 1000 ? '#800026' :
               d > 500  ? '#BD0026' :
               d > 200  ? '#E31A1C' :
               d > 100  ? '#FC4E2A' :
               d > 50   ? '#FD8D3C' :
               d > 20   ? '#FEB24C' :
               d > 10   ? '#FED976' :
                          '#FFEDA0';
    }

    function style(feature) {
        return {
            fillColor: '#000080',
            weight: 5,
            opacity: 0.7,
            color: '#000080',
            
        };
    }

    function stylePropLindeira(feature) {
        return {
            fillColor: '#808080',
            weight: 3,
            opacity: 0.7,
            color: '#FF4500',
            
        };
    }

    function styleRodovia(feature) {
        return {
            fillColor: '#808080',
            weight: 3,
            opacity: 0.7,
            color: '#FF4500',
            
        };
    }
     

    function onResult(result){

      //var dups = result.dups.features;
      var profaixa = result.profaixa.features;
      var rodovias = result.rodovia.features;
      var propriedadesLindeiras = result.propriedadesLindeira.features;

      console.log('Total rodovias: ' + rodovias.length);

      $scope.initialLayers[profaixaLayerName] = {
        'layer': L.geoJson(profaixa, {
            onEachFeature: propertiesProfaixa,
            style: style,
        }),
        'legend': {'url': 'images/icons/road.png', 'type': 'png'}
      };

      $scope.initialLayers[PropriedadesLindeirasLayerName] = {
        'layer': L.geoJson(propriedadesLindeiras, {
          onEachFeature: propertiesPropLindeira,
          style: stylePropLindeira,
        }),
        'legend': {'url': 'images/icons/prop-lindeira.png', 'type': 'png'}
      };

      $scope.initialLayers[RodoviaLayerName] = {
        'layer': L.geoJson(rodovias, {
          onEachFeature: propertiesRodovia,
          style: styleRodovia,
        }),
        'legend': {'url': 'images/icons/prop-lindeira.png', 'type': 'png'}
      };

      console.log('add layer to map');
      console.log($scope.initialLayers);

      //$timeout(removeLayers, 5000);
    }

    /**
     * Tratamento da falha ao pesquisar dados sobre helicópteros e veiculos
     * @param error
    */

    function onError(error){
      console.error(error);
    }

    function dolayer(url, layer, options) {

    }

    //var dupRequest = RestApi.get({type: 'dups'});
    var profaixaRequest = RestApi.getPoints({type: 'profaixa'});
    var rodoviasRequest = RestApi.getPoints({type: 'rodovia'});
    var propriedadesLindeirasRequest = RestApi.getPoints({type: 'propriedade-lindeira'});

    var promises = {
      //dups : dupRequest.$promise,
      profaixa: profaixaRequest.$promise,
      rodovia: rodoviasRequest.$promise,
      propriedadesLindeira: propriedadesLindeirasRequest.$promise,

    };

    var allPromise = $q.all(promises);

    allPromise.then(onResult, onError);

  });
