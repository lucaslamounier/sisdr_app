'use strict';

/**
 * @ngdoc function
 * @name operationsApp.controller:OperacoesCtrl
 * @description
 * # OperacoesCtrl
 * Controller of the operationsApp
 */
angular.module('sisdrApp')
  .controller('OperacoesCtrl', function ($scope, $rootScope, RestApi, $q, symbologies, GISHelper, formData, $timeout, auth) {

    var vehiclesLayerName = 'Viaturas: últimas posições';
    var heliLayerName = 'Helicopteros: últimas posições';
    var infractionsLayerName = 'Autos de Infração: Últimos Autos';
    var embargosLayerName = 'Embargos: Últimos embargos';
    var operationsLayerName = 'Operações ativas';

    var wmsCTFName = 'GEOCTF';
    var acaoFiscalName = 'Ação Fiscalizatória';
    var areaDesenAmazName = 'Amazônia Legal';
    var areaDesenSemiName = 'Semi Árido';
    var areaDesenContName = 'Zona Contígua';
    var areaDesenMarName = 'Mar Territorial';
    var areaDesenFaixaName = 'Faixa de Fronteira';
    var areaDesenZonaName = 'Zona Econômica Exclusiva';
    var edificacaoName = 'Unidades do IBAMA';
    var prodesName = 'Kernel PRODES'
    var sislicName = 'SISLIC';
    var rotaAereaName = 'Rota Aérea';
    var qavRotaName = 'QAV Rota';

    var user = auth.getUser();
    var username = user.username;
    var password = user.password;

    /**
     * Tratamento de dados para retorno de simbologia para autos de infração
     * Também utilizada em diretiva de autos de infração por se tratar de mesma simbologia
     * @param feature, latlng
    */
    $scope.infractionsToMarker = function(feature, latlng) {
      var marker;
      marker = symbologies.make(latlng, 'infractions-last');
      marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
      return marker;
    }

    /**
     * Tratamento de dados para retorno de simbologia para embargos
     * Também utilizada em diretiva de embargos por se tratar de mesma simbologia
     * @param error
    */
    $scope.embargosFeature = function(feature, layer){
      if(feature.properties){
          layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
      }
    }

    $scope.embargosToMarker = function (feature, latlng){
      var marker;
      marker = symbologies.make(latlng, 'embargos-last');
      marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
      return marker;
    }

    /**
     * Remoção de overlayers adicionadas ao mapa, chamada por $timeout
    */
    function removeLayers(){
      if($scope.initialLayers[vehiclesLayerName])
        $scope.map.removeLayer($scope.initialLayers[vehiclesLayerName]);
      if($scope.initialLayers[heliLayerName])
        $scope.map.removeLayer($scope.initialLayers[heliLayerName]);
      if($scope.initialLayers[infractionsLayerName])
        $scope.map.removeLayer($scope.initialLayers[infractionsLayerName]);
      if($scope.initialLayers[embargosLayerName])
        $scope.map.removeLayer($scope.initialLayers[embargosLayerName]);
      if($scope.initialLayers[operationsLayerName])
        $scope.map.removeLayer($scope.initialLayers[operationsLayerName]);
      $scope.map.setView([-16, -48], 4);
    }

    /**
     * Tratamento de dados para retorno de simbologia para viaturas
     * @param feature, latlng
    */
    function vehicleToMaker(feature, latlng) {
      var marker;
      marker = symbologies.make(latlng, 'vehicles-pos');
      marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
      return marker;
    }

    /**
     * Tratamento de dados para retorno de simbologia para helicópteros
     * @param feature, latlng
    */
    function helicopterToMarker(feature, latlng) {
      var marker;
      marker = symbologies.make(latlng, 'helicopters-pos');
      marker.bindPopup(GISHelper.createHTMLPopup(feature.properties));
      return marker;
    }

    function operationsToPolygon(feature, layer){
      if(feature.properties){
          layer.bindPopup(GISHelper.createHTMLPopup(feature.properties));
      }
    }

    /**
     * Resultado da requisição das últimas posições
     * Helicópteros, Viaturas, Autos de Infração e Embargos
     * @param data
    */
    function onResult(result){

      var vehicles = result.vehicles.features;
      var helicopters = result.helicopters.features;
      var infractions = result.infractions.features;
      var embargos = result.embargos;
      var operations = result.operations;
      var embargosCentroid = result.embargosCentroid;

      embargos.features = embargos.features.concat(embargosCentroid.features)

      // $scope.initialLayers[heliLayerName] = L.geoJson(helicopters, {pointToLayer: helicopterToMarker});
      // $scope.initialLayers[vehiclesLayerName] = L.geoJson(vehicles, {pointToLayer: vehicleToMaker});
      // $scope.initialLayers[operationsLayerName] = L.geoJson(operations, {onEachFeature: operationsToPolygon});
      // $scope.initialLayers[infractionsLayerName] = L.geoJson(infractions, {pointToLayer: $scope.infractionsToMarker});
      // $scope.initialLayers[embargosLayerName] = L.geoJson(embargos, {
      //     onEachFeature: $scope.embargosFeature,
      //     pointToLayer: $scope.embargosToMarker,
      //     style: GISHelper.embargoStyle
      // });
      $scope.initialLayers[heliLayerName] = {
        'layer': L.geoJson(helicopters, {pointToLayer: helicopterToMarker}),
        'legend': {'url': 'images/icons/helicopter-icon.png', 'type': 'png'}
      };
      $scope.initialLayers[vehiclesLayerName] = {
        'layer': L.geoJson(vehicles, {pointToLayer: vehicleToMaker}),
        'legend': {'url': 'images/icons/car-location.png', 'type': 'png'}
      };
      $scope.initialLayers[operationsLayerName] = {
        'layer': L.geoJson(operations, {onEachFeature: operationsToPolygon}),
        'legend': {'url': 'images/icons/pol-icon.png', 'type': 'png'}
      };
      $scope.initialLayers[infractionsLayerName] = {
        'layer': L.geoJson(infractions, {pointToLayer: $scope.infractionsToMarker}),
        'legend': {'url': 'images/icons/circle-icon.png', 'type': 'circle', 'fill': '#8B0000'}
      };
      $scope.initialLayers[embargosLayerName] = {
        'layer': L.geoJson(embargos, {
                  onEachFeature: $scope.embargosFeature,
                  pointToLayer: $scope.embargosToMarker,
                  style: GISHelper.embargoStyle
                }),
        'legend': {'url': 'images/icons/circle-icon.png', 'type': 'circle', 'fill': '#A0522D'}
      };

      console.log($scope.initialLayers);

      if(infractions.length) {
        $scope.csvInfractions = GISHelper.csvReturn(infractions, 'latLng');
        $scope.InfractionsLastData = infractions.map(GISHelper.formatData); //Returning values to CSV
        $scope.lastInfractionName = infractionsLayerName; //LastLayer of Infractions to pan on table click
        $scope.InfractionsList = true;
      }
      if(embargos.length) {
        var keys = GISHelper.csvReturn(embargos.features, 'latLng', true);
        keys.keys.pop();
        keys.titles.pop();
        $scope.csvEmbargos = keys;
        $scope.EmbargosLastData = embargos.features.map(GISHelper.embargosFormatData);
        $scope.lastEmbargosName = embargosLayerName;
        $scope.EmbargosList = true;
      }

      var rotaAereaLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: rotaAereaName,
        layers: 'csr:tra_rota_aerea_l',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      var qavRotaerLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: qavRotaName,
        layers: 'csr:tra_qav_rotaer_p',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      var sislicLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: sislicName,
        layers: 'csr:adm_sislic_p',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      var ctfLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: wmsCTFName,
        layers: 'csr:adm_geo_pessoa_ctf_app_p',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      var acaoFiscalLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: acaoFiscalName,
        layers: 'csr:adm_acao_fiscalizatoria_p',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      var areaDesenAmazLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: areaDesenAmazName,
        layers: 'csr:lim_area_desenv_controle_operacoes_a',
        format: 'image/png',
        viewparams: 'tipo:1',
        transparent: true,
        version: '1.1.0'
      });

      var areaDesenSemiLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: areaDesenSemiName,
        layers: 'csr:lim_area_desenv_controle_operacoes_a',
        format: 'image/png',
        viewparams: 'tipo:2',
        transparent: true,
        version: '1.1.0'
      });

      var areaDesenContLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: areaDesenContName,
        layers: 'csr:lim_area_desenv_controle_operacoes_a',
        format: 'image/png',
        viewparams: 'tipo:3',
        transparent: true,
        version: '1.1.0'
      });

      var areaDesenMarLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: areaDesenMarName,
        layers: 'csr:lim_area_desenv_controle_operacoes_a',
        format: 'image/png',
        viewparams: 'tipo:4',
        transparent: true,
        version: '1.1.0'
      });

      var areaDesenFaixaLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: areaDesenFaixaName,
        layers: 'csr:lim_area_desenv_controle_operacoes_a',
        format: 'image/png',
        viewparams: 'tipo:5',
        transparent: true,
        version: '1.1.0'
      });

      var areaDesenZonaLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: areaDesenZonaName,
        layers: 'csr:lim_area_desenv_controle_operacoes_a',
        format: 'image/png',
        viewparams: 'tipo:6',
        transparent: true,
        version: '1.1.0'
      });

      var edificacaoLayer = L.tileLayer.wms("http://siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: edificacaoName,
        layers: 'csr:adm_edif_pub_civil_ibama_p',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      var prodesLayer = L.tileLayer.wms("http://"+username+':'+password+"@siscom.ibama.gov.br/geoserver/csr/wms", {
        // title: prodesName,
        layers: 'csr:veg_kernel_prodes_a',
        format: 'image/png',
        transparent: true,
        version: '1.1.0'
      });

      // $scope.wmsLayers[rotaAereaName] = rotaAereaLayer;
      // $scope.wmsLayers[qavRotaName] = qavRotaerLayer;
      // $scope.wmsLayers[sislicName] = sislicLayer;
      // $scope.wmsLayers[wmsCTFName] = ctfLayer;
      // $scope.wmsLayers[acaoFiscalName] = acaoFiscalLayer;
      // $scope.wmsLayers[areaDesenAmazName] = areaDesenAmazLayer;
      // $scope.wmsLayers[areaDesenSemiName] = areaDesenSemiLayer;
      // $scope.wmsLayers[areaDesenContName] = areaDesenContLayer;
      // $scope.wmsLayers[areaDesenMarName] = areaDesenMarLayer;
      // $scope.wmsLayers[areaDesenFaixaName] = areaDesenFaixaLayer
      // $scope.wmsLayers[areaDesenZonaName] = areaDesenZonaLayer;
      // $scope.wmsLayers[edificacaoName] = edificacaoLayer;
      // $scope.wmsLayers[prodesName] = prodesLayer;

      $scope.wmsLayers[rotaAereaName] = {
        'layer': rotaAereaLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:tra_rota_aerea_l', 'type': 'png'}
      };
      $scope.wmsLayers[qavRotaName] = {
        'layer': qavRotaerLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:tra_qav_rotaer_p', 'type': 'png'}
      };
      $scope.wmsLayers[sislicName] = {
        'layer': sislicLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=2&LAYER=csr:adm_sislic_p&LEGEND_OPTIONS=forceLabels:off;', 'type': 'png'}
      };
      $scope.wmsLayers[wmsCTFName] = {
        'layer': ctfLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=2&LAYER=csr:adm_geo_pessoa_ctf_app_p&LEGEND_OPTIONS=forceLabels:off;', 'type': 'png'}
      };
      $scope.wmsLayers[acaoFiscalName] = {
        'layer': acaoFiscalLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:adm_acao_fiscalizatoria_p', 'type': 'png'}
      };
      $scope.wmsLayers[areaDesenAmazName] = {
        'layer': areaDesenAmazLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:lim_area_desenv_controle_operacoes_a&LEGEND_OPTIONS=forceLabels:off&RULE=Amazônia Legal', 'type': 'png'}
      };
      $scope.wmsLayers[areaDesenSemiName] = {
        'layer': areaDesenSemiLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:lim_area_desenv_controle_operacoes_a&LEGEND_OPTIONS=forceLabels:off&RULE=Semi Árido', 'type': 'png'}
      };
      $scope.wmsLayers[areaDesenContName] = {
        'layer': areaDesenContLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:lim_area_desenv_controle_operacoes_a&LEGEND_OPTIONS=forceLabels:off&RULE=Zona Contígua', 'type': 'png'}
      };
      $scope.wmsLayers[areaDesenMarName] = {
        'layer': areaDesenMarLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:lim_area_desenv_controle_operacoes_a&LEGEND_OPTIONS=forceLabels:off&RULE=Mar Territorial', 'type': 'png'}
      };
      $scope.wmsLayers[areaDesenFaixaName] = {
        'layer': areaDesenFaixaLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:lim_area_desenv_controle_operacoes_a&LEGEND_OPTIONS=forceLabels:off&RULE=Faixa de Fronteira', 'type': 'png'}
      };
      $scope.wmsLayers[areaDesenZonaName] = {
        'layer': areaDesenZonaLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:lim_area_desenv_controle_operacoes_a&LEGEND_OPTIONS=forceLabels:off&RULE=Zona Econômica Exclusiva', 'type': 'png'}
      };
      $scope.wmsLayers[edificacaoName] = {
        'layer': edificacaoLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=csr:adm_edif_pub_civil_ibama_p', 'type': 'png'}
      };
      $scope.wmsLayers[prodesName] = {
        'layer': prodesLayer,
        'legend': {'url': 'http://siscom.ibama.gov.br/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=2&LAYER=csr:veg_kernel_prodes_a&LEGEND_OPTIONS=forceLabels:off', 'type': 'png'}
      };
      $timeout(removeLayers, 5000);
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

    var heliRequest = RestApi.last_position({type : 'helicopters-api'});
    var vehiclesRequest = RestApi.last_position({type: 'vehicles-api'});
    var infractionsRequest = RestApi.getObject({type: 'infractions-api', model: 'last-infractions'});
    var embargosRequest = RestApi.getObject({type: 'banning-api', model: 'last-banning'});
    var embargosCentroid = RestApi.getObject({type: 'banning-api', model: 'last-banning', centroid:true});
    var operations = RestApi.getObject({type:'operations-api', model: 'activated-list'});

    var promises = {
      helicopters : heliRequest.$promise,
      vehicles : vehiclesRequest.$promise,
      infractions : infractionsRequest.$promise,
      embargos : embargosRequest.$promise,
      embargosCentroid : embargosCentroid.$promise,
      operations : operations.$promise
    };

    var allPromise = $q.all(promises);

    allPromise.then(onResult, onError);
  });
