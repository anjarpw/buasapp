angular.module('buasApp', ["facebookService","ui.bootstrap","searchPeopleController"])
.controller('MainController', ["$scope","facebookService",
  function($scope,facebookService) {
  facebookService.init(FB,'422013594638327');
  $scope.status="WAITING";
  $scope.authResponse=null;
  var handleLogin=function(response){
      $scope.authResponse=response.authResponse;
      $scope.status="LOGGED IN";
  };
  $scope.login=function(){
    var deferred = facebookService.doLogin();
    deferred.promise.then(handleLogin);    
  };
  $scope.setViewMode=function(viewMode){
    $scope.activeViewMode=viewMode;
  }
  $scope.checkLogin=function(){
    var deferred = facebookService.checkLoginStatus();
    deferred.promise.then(handleLogin,function(response){
      $scope.authResponse=null;
      $scope.status="LOGGED IN REJECTED";
    });
  };

  $scope.viewModes=["PEOPLE","PAGES","PLACES","EVENTS","APPS","GROUPS","PHOTOS"];
  $scope.activeViewMode=$scope.viewModes[0];
}])
;


