'use strict';

/**
 * @ngdoc function
 * @name sisdrApp.controller:EstatisticasCtrl
 * @description
 * # EstatisticasCtrl
 * Controller of the sisdrApp
 */
angular.module('sisdrApp')
 .controller('EstatisticasCtrl', function ($timeout, $scope, RestApi, formData) {

 	$scope.requestInfraction = requestInfraction;
 	$scope.years = formData.anos;
 	$scope.infractionsSelected = [];
	requestInfraction(2015);

 	function returnMonth(data){
 		var meses = formData.meses;

		data.mes = meses[parseInt(data.mes-1)];
		return data;
 	}

 	function formatData(data){
 		var col = [],
 			line = [];

 		angular.forEach(data, function(value, key){
 			col.push(value.mes);
 			line.push(value.quantidade);
 		})

 		return {
 			dado: line,
 			categories: col
 		};

 	}

 	function arrayContains(el, array){
 		for(var i=0; i< array.length; i++){
 			if(el == array[i])
 				return 1;
 		}

 		return 0;
 	}

 	function requestInfraction(data){

	    $scope.selectedYear = data;

	    if(!(arrayContains(data, $scope.infractionsSelected)) ){
	    	var infractionsRequest = RestApi.get({type: 'infractions-api', model: 'infractions-by-year', start: data});
	    	$scope.loading = true;
	    	$scope.infractionsSelected.push(data);
		    infractionsRequest.$promise.then(function(data){
		    	data = data.map(returnMonth);
		    	data = formatData(data);

				data.dado.unshift($scope.selectedYear.toString());

	    		$scope.loading = false;
				if(!$scope.chart){

				    $scope.chart = c3.generate({
				        data: {
					        columns: [
					        	data.dado
					        ],
					        // type: "area"
					        type: "line"
				        },
			            zoom: {
					        enabled: true
					    },
				        axis: {
				        	x: {
				        		type: 'category',
				        		categories: data.categories
				        	},
			        	 	y : {
		        	            tick: {
					               format: function (d) { return d + ' autos'; }
					            }
					        }
				        }

				    });
				} else {
					$scope.chart.load({
						columns: [
				        	data.dado
				        ],
				        type: "line"
					});
				}

		    })

	    } else {
	    	alert('data contains!!');
	    }
 	}
 });
