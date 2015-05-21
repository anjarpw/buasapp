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
      id:"="
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
        if(scope.caret==-1){
          scope.model=scope.searchKeyword;
        }else{
          scope.model=scope.populatedItems[scope.caret];
        }
        if(scope.onSelected){
          scope.onSelected();
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
      onSelected:'&'
    },
    link:function(scope){
      scope.handleOnChange=function(keyword,callback){
        scope.onChange({
          $keyword:keyword,
          $callback:callback
          });
      };
      scope.handleOnSelected=function(){
        scope.onSelected();
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
      onSelected:'&'
    },
    link:function(scope){
      scope.handleOnChange=function(keyword,callback){
        scope.onChange({
          $keyword:keyword,
          $callback:callback
          })
      };
      scope.handleOnSelected=function(){
        scope.onSelected();
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
        return deferred.promise;
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
        return deferred.promise;
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
        return deferred.promise;
      }
    };
}]);;
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


