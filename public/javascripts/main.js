angular.module('buasApp', ["autocomplete","facebookService"])
.service("searchFormModel",function(){
  return {
    generateSearchFormModel:function(facebookService, type, queryLimit, showLimit, filter){
      queryLimit=queryLimit || 8;
      showLimit= showLimit || 8;
      filter=filter || function(u){return true;};
      return {
          type:type,
          filter:filter,
          queryLimit:queryLimit,
          showLimit:showLimit,
          httpDeferredRequests:[],
          cancelPreviousRequest:function(){
            this.httpDeferredRequests.forEach(function(req){
              req.reject();
            });
            this.httpDeferredRequests=[];
          },
          populate:function(keyword, callback){
            var obj={
              type:this.type,
              q:keyword,
              limit:this.queryLimit,
              pretty:0,
            };            
            var populatedData=[];
            this.cancelPreviousRequest();
            var t=this;
            callback(populatedData);                                          
            var callApi=function(){
              var deferred=facebookService.useApi("search",obj);
              t.httpDeferredRequests.push(deferred);
              deferred.promise.then(function(res){
                res.data.forEach(function(u){
                  if(t.filter(u) && populatedData.length<t.showLimit){
                    populatedData.push(u);
                  }
                });
                var possibleMore= res.data.length>0;
                if(populatedData.length<t.showLimit && possibleMore){                  
                  obj.after=res.paging.cursors.after;
                  callApi();
                }

              });
            };
            callApi();
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

  var searchLocationFunc=function(u){
    return ["City","State","Country","County","Region", "Province","Region", "Government organization"].indexOf(u.category)>=0;
  };
  $scope.criterias=[
    {
      name:"Living in",      
      template:'live.html',
      getSelectionModel:function(){
        return {
          searchModel:searchFormModel.generateSearchFormModel(facebookService,"page",100,20,searchLocationFunc),          
          value:null,
          selected:false,
          onSearchItemSelected:function(newValue){
            this.value=newValue;
            this.selected=true;
          },
          compose:function(){
            if(this.value){
              var keyword="";
              if(this.value.id){
                keyword=this.value.id;
              }else{
                keyword="str/"+this.value+"/keywords_pages"
              }
                keyword+="/residents/present";
                return keyword;                
            }
            return "";
          }          
        };
      }
    },
    {
      name:"Lived in",
      template:'live.html',
      getSelectionModel:function(){
        return {
          searchModel:searchFormModel.generateSearchFormModel(facebookService,"page",100,20,searchLocationFunc),          
          value:null,
          selected:false,
          onSearchItemSelected:function(newValue){
            this.value=newValue;
            this.selected=true;
          },
          compose:function(){
            if(this.value){
              var keyword="";
              if(this.value.id){
                keyword=this.value.id;
              }else{
                keyword="str/"+this.value+"/keywords_pages"
              }
                keyword+="/residents/past";
                return keyword;                
            }
            return "";
          }          
        };
      }
    },
    {
      name:"Visited ",
    },    
    {
      name:"Relationship Status",
      template:'relationshipstatus.html',
      getSelectionModel:function(){
        return {
          value:"",
          compose:function(){
            return this.value+"/users";
          }
        }
      }
    },    
    {
      name:"age between",
      template:'agebetween.html',
      getSelectionModel:function(){
        var possibleAges=[];
        for(i=0; i<=100; i++){
          possibleAges.push(i);
        }
        return {
          value:{from:0,to:65},
          compose:function(){
            return this.value.from+"/"+this.value.to+"/users-age-2";
          },
          possibleAges:possibleAges
        }
      }
    },    
    {
      name:"Gender",
      template:'gender.html',
      getSelectionModel:function(){
        return {
          value:"",
          compose:function(){
            return this.value;
          }
        }
      }
    },    
    {
      name:"Interested in",
      template:'interestedin.html',
      getSelectionModel:function(){
        return {
          value:"",
          compose:function(){
            return this.value+"/users-interested";
          }
        }
      }
    },    
    {
      name:"Like... ",
      template:'live.html',
      getSelectionModel:function(){
        return {
          searchModel:searchFormModel.generateSearchFormModel(facebookService,"page",20,20),
          value:null,
          selected:false,
          onSearchItemSelected:function(newValue){
            this.value=newValue;
            this.selected=true;
          },          
          compose:function(){
            if(this.value){
              var keyword="";
              if(this.value.id){
                keyword=this.value.id;
              }else{
                keyword="str/"+this.value+"/keywords_pages"
              }
                keyword+="/likers";
                return keyword;                
            }
            return "";
          }          
        };
      }
    },    
    {
      name:"Commented... "
    },    
  ]
  $scope.deleteSearchParam=function(searchParam){
    var index=$scope.fbSearchParams.indexOf(searchParam);
    if (index > -1) {
      $scope.fbSearchParams.splice(index, 1);
    }
  };
  $scope.fbSearchParams=[];
  $scope.addFbParam=function(){
    var obj = {
      criteria:null,
      model:null,
    };
    $scope.fbSearchParams.push(obj);
  }
  $scope.addFbParam();
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
  $scope.arrangePath=function(){
    var searchPath="";
    $scope.fbSearchParams.forEach(function(u){
      searchPath+=u.model.compose()+"/";
    });
    searchPath+="intersect";
    $scope.searchPath=searchPath;
  };
  $scope.viewModes=["PEOPLE","PAGES","PLACES","EVENTS","APPS","GROUPS","PHOTOS"];
  $scope.activeViewMode=$scope.viewModes[0];
}])
;


