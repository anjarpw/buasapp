angular.module('buasApp', ["autocomplete","facebookService"])
.service("searchFormModel",function(){
  return {
    generateSearchFormModel:function(facebookService, type){
      return {
          type:type,
          populate:function(keyword, callback){
            var obj={
              type:this.type,
              q:keyword
            };
            facebookService.useApi("search",obj).then(function(res){
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

  $scope.searchJobModel=searchFormModel.generateSearchFormModel(facebookService,"adworkposition");
  $scope.searchPageModel=searchFormModel.generateSearchFormModel(facebookService,"page");
  $scope.searchPlaceModel=searchFormModel.generateSearchFormModel(facebookService,"place");
  $scope.searchUserModel=searchFormModel.generateSearchFormModel(facebookService,"user");

  var handleLogin=function(response){
      $scope.authResponse=response.authResponse;
      $scope.status="LOGGED IN";
  };
  $scope.login=function(){
    var promise = facebookService.doLogin();
    promise.then(handleLogin);    
  };
  $scope.setViewMode=function(viewMode){
    $scope.activeViewMode=viewMode;
  }
  $scope.checkLogin=function(){
    var promise = facebookService.checkLoginStatus();
    promise.then(handleLogin,function(response){
      $scope.authResponse=null;
      $scope.status="LOGGED IN REJECTED";
    });
  };
  $scope.viewModes=["PEOPLE","PAGES","PLACES","EVENTS","APPS","GROUPS","PHOTOS"];

  $scope.activeViewMode=$scope.viewModes[0];
}])
;


