'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:sisdrCtrl
 * @description
 * # sisdrCtrl
 * Controller of the sisdrApp
 */

 function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

angular.module('sisdrApp')
  .controller('sisdrCtrl', function ($scope, $rootScope, RestApi, $cookies, $q, symbologies, GISHelper, formData, $timeout, auth) {


    var profaixaLayerName = 'Profaixa';
    var RodoviaLayerName = 'Rodovias';
    var PropriedadesLindeirasLayerName = 'Propriedades Lindeiras';
    $scope.filter = {};

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
       
     /**
     * Resultado da requisição
     * @param data
      */
    function onResult(result){

      var rodovias, profaixa = result.profaixa.features;
      if(result.rodovia && result.rodovia.features.length){
            rodovias = result.rodovia.features;
            $cookies.put('rodovias', angular.toJson(rodovias));
      }else if($cookies.get('rodovias')){
            console.log('cookie rodovia');
            rodovias = $cookies.rodovias;
      }
     
      var propriedadesLindeiras = result.propriedadesLindeira.features;
      

      //console.log('Total rodovias: ' + rodovias.length);

      $scope.initialLayers[profaixaLayerName] = {
        'layer': L.geoJson(profaixa, {
            onEachFeature: propertiesProfaixa,
            style: style,
        }),
        'legend': {'url': 'images/icons/road-perspective.png', 'type': 'png'}
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
        'legend': {'url': 'images/icons/two-roads-cross.png', 'type': 'png'}
      };

      console.log('add layer to map');
      console.log($scope.initialLayers);
      $scope.filter.carregar = false;

      //$timeout(removeLayers, 5000);
    }

    /**
     * Tratamento da falha ao pesquisar dados
     * @param error
    */

    function onError(error){
      console.error(error);
      $scope.filter.carregar = false;
    }

    function dolayer(url, layer, options) {

    }

    var profaixaRequest = RestApi.getPoints({type: 'profaixa'});

    if(typeof $cookies.get('rodovias') === "undefined" || !$cookies.get('rodovias')){
      var rodoviasRequest = RestApi.getPoints({type: 'rodovia'});
      console.log('rodovias request');
    
    }else{
      console.log('rodovias null');
      var rodoviasRequest = null;
    }

    var propriedadesLindeirasRequest = RestApi.getPoints({type: 'propriedade-lindeira'});

    $scope.filter.carregar = true;

    var promises = {
      profaixa: profaixaRequest.$promise,
      propriedadesLindeira: propriedadesLindeirasRequest.$promise,
    };

    if(rodoviasRequest){
      promises.rodovias = rodoviasRequest;
    }

    var allPromise = $q.all(promises);

    allPromise.then(onResult, onError);

  });
