var nameApp = angular.module('nameApp', []);
nameApp.controller('NameCtrl', function ($scope, $http, $location){
  	$scope.auth = true;
  	$scope.error = '';
    $scope.buttonName = "Sign up";
	$scope.login = function(user) {
		$http({
	  		method: 'POST',
	  		url: '/login',
	   		data: user
		}).then(function successCallback(response) {
			if (response.data === "User doesn't exist" 
				|| response.data === "Password is invalid"){
				$scope.error = response.data;
			}else{
				window.location.replace("/webapp#/lists");
			}
	  	}, function errorCallback(response) {
	  		throw new Error('Error!');
	  	});
    };
    $scope.registrate = function(user) {
		$http({
			method: 'POST',
			url: '/registration',
			data: user
		}).then(function successCallback(response) {
			if (response.data === "Invalid email or password length is less than 7 symbols" 
				|| response.data === "Dublicate users"){
				$scope.error = response.data;
			}else{
			window.location.replace("/webapp#/lists")
		}
	  	}, function errorCallback(response) {
	    	throw new Error('Error!');
	  	});
     };
    $scope.change = function(){
  		$scope.error = '';
      	if ($scope.auth){
      		$scope.auth = false;
    		$scope.buttonName = 'Login'
      	}
      	else{
      		$scope.auth = true;
    		$scope.buttonName = "Sign up";
      	}
    }
});