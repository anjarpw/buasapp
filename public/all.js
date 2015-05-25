angular.module('autocomplete', [])
.directive("autocomplete",["$timeout","$window",function($timeout,$window){
  return{
    restrict: 'E',
    transclude:true,
    replace:true,
    scope:{
      model:'=',
      onChange:'&',
      onSelected:'&',
      id:"=",
      disabled:"="
    },
    link:function(scope,element,attr){
      var e=$(angular.element(element));
      var input=e.find('input').eq(0);
      scope.handleKeyDown = function(evt){
        switch(evt.keyCode){
          case 40:
            scope.caret++;
            break;
          case 38:
            scope.caret--;
            break;
          case 13:
            scope.selectCurrent();
            break;
          case 27:
            scope.reset();
            break;
          default:
            scope.handleOnChange();
        }
        if(scope.caret<-1){
          scope.caret=scope.populatedItems.length-1;
        }else if(scope.caret>=scope.populatedItems.length){
          scope.caret=-1;
        }
      };

      e.blur(function(){
        $timeout(function(){
          //scope.showSearch=false;
        });
      });
      e.click(function(evt){
        //evt.stopPropagation();
      });
      $($window).click(function(evt){
        $timeout(function(){
          scope.showSearch=false;
        });
      });

      input.keydown(function(evt){
        $timeout(function(){
          console.log("DOWN "+scope.id);
          scope.handleKeyDown(evt);
        });
      });
      scope.handleOnChange=function(){
        if(scope.onChange){
          scope.showSearch=true;
          var obj={
            $keyword:scope.searchKeyword,
            $callback:function(result){
              if(result){
                scope.populatedItems=result;
                scope.caret=-1;
              }
            }
          };
          scope.onChange(obj);              
        }        
      }
      scope.selectIndex=function(idx){
        scope.caret=idx;
        scope.selectCurrent();
      }

      scope.selectCurrent=function(){
        var oldValue=scope.model;
        if(scope.caret==-1){
          scope.model=scope.searchKeyword;
        }else{
          scope.model=scope.populatedItems[scope.caret];
        }
        if(scope.onSelected){
          scope.onSelected({
            $newValue:scope.model,
            $oldValue:oldValue
          });
        }
        scope.reset();
      };
      scope.reset=function(){
        scope.caret=-1;
        scope.searchKeyword="";
        scope.populatedItems=[];
        scope.showSearch=false;
      }
      scope.reset();
    },
    templateUrl:"/static/templates/autocomplete.html"
  };
}])
.directive("autocompleteFbUser",["$timeout","$window",function($timeout,$window){
  return{
    restrict: 'E',
    transclude:false,
    replace:true,
    scope:{
      model:'=',
      onChange:'&',
      onSelected:'&',
      disabled:"="
    },
    link:function(scope){
      scope.handleOnChange=function(keyword,callback){
        scope.onChange({
          $keyword:keyword,
          $callback:callback
          });
      };
      scope.handleOnSelected=function(newValue,oldValue){
        scope.onSelected({
          $newValue:newValue,
          $oldValue:oldValue
        });
      };
    },    
    templateUrl:"/static/templates/autocompleteFbUser.html"
  };
}])
.directive("autocompleteFbPage",["$timeout","$window",function($timeout,$window){
  return{
    restrict: 'E',
    transclude:false,
    replace:true,
    scope:{
      model:'=',
      onChange:'&',
      onSelected:'&',
      disabled:"="
    },
    link:function(scope){
      scope.handleOnChange=function(keyword,callback){
        scope.onChange({
          $keyword:keyword,
          $callback:callback
          })
      };
      scope.handleOnSelected=function(newValue,oldValue){
        scope.onSelected({
          $newValue:newValue,
          $oldValue:oldValue
        });
      };
    },
    templateUrl:"/static/templates/autocompleteFbPage.html"
  };
}]);


;
var FunctionDictionary=function(){
	return {
		dictionary:[],
		set:function(key,func){
			this.dictionary[key]=func;
		},
		get:function(key){
			return this.dictionary[key];
		}
	};
};
var MessageBasedSender=function(){
	return {
		toMessage:function(methodName,args){
			return {
				methodName:methodName,
				args:args
			}
		},
		sendMessage:function(message,callback){

		},
		invoke : function(methodName, args, callback){
			var message=this.toMessage(methodName,args);
			this.sendMessage(message,callback);
		}
	};
};
var MessageBasedReceiver=function(){
	return {
		functionDictionary:FunctionDictionary(),
		setHandler:function(methodName, handler){
			this.functionDictionary.set(methodName,handler);		
		},
		handle:function(methodName, args,evt){
			var func=this.functionDictionary.get(methodName);
			if(func){
				return func(args,evt);
			}
			return null;
		},
		onMessageReceived:function(evt){
			var message=this.messageExtractor(evt);
			if(!message){
				return;
			}
			var returnValue=this.handle(message.methodName,message.args,evt);
			if(returnValue){
				this.replyMessage(evt,returnValue);
			}
		},
		messageExtractor:function(evt){

		},
		replyMessage:function(evt,returnValue){

		}
	};
};


var CrossFrameSender=function(currentWindow,targetWindow,targetUrl){
	var sender=new MessageBasedSender();
	sender.targetWindow=targetWindow;
	sender.targetUrl=targetUrl;
	sender.currentWindow=currentWindow;
	sender.requestCallbackDictionary = FunctionDictionary();
	

	sender.currentWindow.addEventListener('message',function(evt){
		var callback=sender.requestCallbackDictionary.get(event.data.requestId);
		if(callback){
			callback(event.data.returnValue);
		}
	});	
	sender.requestIdCount=0;
	sender.sendMessage = function(message, callback){
		this.requestIdCount++;
		message.requestId=this.requestIdCount;
		this.requestCallbackDictionary.set(this.requestIdCount,callback);
		this.targetWindow.postMessage(message,this.targetUrl);		
	};

	return sender;
};
var CrossFrameReceiver=function(currentWindow){
	var receiver=new MessageBasedReceiver();
	receiver.currentWindow=currentWindow;
	receiver.messageExtractor=function(evt){
		var methodName=evt.data.methodName;
		var args=evt.data.args;
		return {
			methodName:methodName,
			args:args
		};
	};
	receiver.replyMessage=function(evt,returnValue){
		evt.source.postMessage({
			isCallback:true,
			returnValue:returnValue,
			requestId:evt.data.requestId
		},evt.origin);
	};
	receiver.currentWindow.addEventListener('message',function(evt){
		receiver.onMessageReceived(evt);
	});	
	return receiver;
};
;
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
}]);;
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


;
angular.module('searchFormModel', [])
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
            var clearedKeyword=keyword;
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
});
angular.module('searchPeopleController', ["autocomplete","selectionModel"])
.controller('searchPeopleController', ["$scope","peopleSelectionModel", "pageSelectionModel",
  function($scope,PeopleSelectionModel,PageSelectionModel) {

    var locationBasedSearch=function(u){
        var categories=["City","State/province/region","Country","Government Organization"];
        var categoryTypes=["City","State","Province","Region","Country","Government Organization"];
        if(u.category && categories.indexOf(u.category)>=0){
            return true;
        }
        if(u.category_list && u.category_list.length>0 && categoryTypes.indexOf(u.category_list[0])>=0){
            return true;
        }
        return false;
    }
    $scope.basicCriterias=[   
      {
        name:"Age between",
        template:'agebetween.html',
        ignored:false,
        selection:PeopleSelectionModel.getAgeSelectionModel()
      },    
      {
        name:"Gender",
        template:'gender.html',
        ignored:false,
        selection:PeopleSelectionModel.getGenderSelectionModel()
      },    
      {
        name:"Interested in",
        template:'interestedin.html',
        ignored:false,
        selection:PeopleSelectionModel.getInterestedInSelectionModel()
      },    
      {
        name:"Religious view",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.generateGetSearchSelectionModel("/users-religious-view","page")()
      },       
    ];

    var livingCriteria={
        name:"Living",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.generateGetSearchSelectionModel("/residents/present","page",locationBasedSearch)()
    };
    var likersCriteria={
        name:"Likes",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.generateGetSearchSelectionModel("/likers", "page")()
    };
    var commentersCriteria={
        name:"Commented on",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.generateGetSearchSelectionModel("/commmenters","page")()
    };
    var groupsCriteria={
        name:"Group Member of",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.generateGetSearchSelectionModel("/members","group")()
    };
    $scope.extendedCriterias=[
        livingCriteria,
        likersCriteria,
        commentersCriteria,
        groupsCriteria
    ];   
    $scope.isBasicInfoOpen=true;
    $scope.expandSelection=function(){
        $scope.expandedMode=true;
    }
    $scope.collapseSelection=function(){
        $scope.expandedMode=false;
    }
  }
]);


;
angular.module('selectionModel', ["searchFormModel","facebookService"])
.service('pageSelectionModel',["searchFormModel","facebookService",function(searchFormModel,facebookService){
  return {
    generateGetSearchSelectionModel:function(suffix,queryType,filterFunc){
      return function(){
        return {
          searchModel:searchFormModel.generateSearchFormModel(facebookService,queryType,20,20,filterFunc),
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
                keyword+=suffix;
                return keyword;                
            }
            return "";
          }          
        };        
      }
    }    
  }
}])
.service('peopleSelectionModel',["searchFormModel","facebookService",function(searchFormModel,facebookService){

  var searchLocationFunc=function(u){
    return ["City","State","Country","County","Region", "Province","Region", "Government organization"].indexOf(u.category)>=0;
  };  
  return {
    getRelationshipSelectionModel:function(){
      return {
        value:"",
        compose:function(){
          return this.value+"/users";
        }
      };
    },
    getAgeSelectionModel:function(){
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
      };
    },
    getGenderSelectionModel:function(){
      return {
        value:"",
        compose:function(){
          return this.value;
        }
      };
    },
    getInterestedInSelectionModel:function(){
      return {
        value:"both",
        compose:function(){
          return this.value+"/users-interested";
        }
      }
    }
  };
}])