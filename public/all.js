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
      onSelected:'&'
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
      onSelected:'&'
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
.service('Switch',function(){
  return {
    generateSwitch:function(){
      return {
        visibilityClass:function(key){
          return key==this.currentKey?"switch-visible":"switch-hidden";
        },
        setCurrent:function(key){
          this.currentKey=key;
        },
        currentKey:""
      };
    }
  };
})
.service('SelectionModel',["searchFormModel","facebookService",function(searchFormModel,facebookService){

  var searchLocationFunc=function(u){
    return ["City","State","Country","County","Region", "Province","Region", "Government organization"].indexOf(u.category)>=0;
  };  
  return {
    jobCriteriaModel:function(){
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
    },    
    liveInCriteriaModel:function(){
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
    },
    relationshipCriteriaModel:function(){
      return {
        value:"",
        compose:function(){
          return this.value+"/users";
        }
      };
    },
    ageCriteriaModel:function(){
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
    genderCriteriaModel:function(){
      return {
        value:"",
        compose:function(){
          return this.value;
        }
      };
    },
    interestedInCriteriaModel:function(){
      return {
        value:"",
        compose:function(){
          return this.value+"/users-interested";
        }
      }
    },
    likeCriteriaModel:function(){
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
  };
}])
.controller('MainController', ["$scope","facebookService","searchFormModel","SelectionModel","Switch",
  function($scope,facebookService,searchFormModel,SelectionModel,Switch) {
  facebookService.init(FB,'422013594638327');
  $scope.status="WAITING";
  $scope.authResponse=null;

  $scope.panelSwitch=Switch.generateSwitch();

  $scope.criterias=[
    {
      name:"Live/Lived in",      
      template:'live.html',
      getSelectionModel:SelectionModel.liveInCriteriaModel
    },
    {
      name:"Job",
      template:'live.html',
      getSelectionModel:SelectionModel.jobCriteriaModel
    },    
    {
      name:"Visited ",
    },    
    {
      name:"Relationship Status",
      template:'relationshipstatus.html',
      getSelectionModel:SelectionModel.relationshipCriteriaModel
    },    
    {
      name:"age between",
      template:'agebetween.html',
      getSelectionModel:SelectionModel.ageCriteriaModel
    },    
    {
      name:"Gender",
      template:'gender.html',
      getSelectionModel:SelectionModel.genderCriteriaModel
    },    
    {
      name:"Interested in",
      template:'interestedin.html',
      getSelectionModel:SelectionModel.interestedInCriteriaModel
    },    
    {
      name:"Like... ",
      template:'live.html',
      getSelectionModel:SelectionModel.likeCriteriaModel
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


