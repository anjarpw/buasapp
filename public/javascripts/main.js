angular.module('buasApp', ["autocomplete","facebookService"])
.service("searchFormModel",function(){
  return {
    generateSearchFormModel:function(facebookService, type){
      return {
          type:type,
          populate:function(keyword, callback){
            facebookService.useApi("search",{
              type:this.type,
              q:keyword
            }).then(function(res){
              callback(res.data); 
            });
          },
          setSelected:function(){                          
          },
          model:null
      };     
    }
  };
})
.controller('MainController', ["$scope","facebookService","searchFormModel",
  function($scope,facebookService,searchFormModel) {
  facebookService.init(FB,'422013594638327');
  $scope.status="WAITING";
  $scope.authResponse=null;

  $scope.searchFormModel1=searchFormModel.generateSearchFormModel(facebookService,"adworkposition");

  var handleLogin=function(response){
      $scope.authResponse=response.authResponse;
      $scope.status="LOGGED IN";
  };
  $scope.login=function(){
    var promise = facebookService.doLogin();
    promise.then(handleLogin);    
  };
  $scope.checkLogin=function(){
    var promise = facebookService.checkLoginStatus();
    promise.then(handleLogin,function(response){
      $scope.authResponse=null;
      $scope.status="LOGGED IN REJECTED";
    });
  };
}])
;


