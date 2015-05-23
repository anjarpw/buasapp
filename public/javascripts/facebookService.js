angular.module('facebookService', [])
.service('facebookService', ['$q','$timeout',function($q,$timeout) {       
    return {
      FB:null,
      init:function(FB,appId,version){
        this.FB=FB;
        version=version || 'v2.3';
        this.FB.init({
          appId      : appId,
          status     : true,
          xfbml      : true,
          version    : version // or v2.0, v2.1, v2.0
        });
      },
      checkLoginStatus:function(){
        var deferred = $q.defer();
        this.FB.getLoginStatus(function(response) {
           if (response.status  === 'connected') {
              deferred.resolve(response);
           } else {
             deferred.reject(response);
           }a
        });              
        return deferred;
      },
      doLogin:function(){
        var deferred = $q.defer();
        this.FB.login(function(response) {
           if (response.authResponse) {
              deferred.resolve(response);
           } else {
             deferred.reject(response);
           }
        });              
        return deferred;
      },
      useApi:function(path, params, method){
        var deferred = $q.defer();
        method=method || "get";
        params=params || null;
        this.FB.api(path, method, params, function(response) {
           if (response.error) {
            deferred.reject(response);
           } else {
            deferred.resolve(response);
           }
        });              
        return deferred;
      }
    };
}]);