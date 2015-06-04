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
                scope.adjustCaret();
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
      scope.adjustCaret=function(){
        if(scope.caret>=scope.populatedItems.length){
          scope.caret=-1;
        }
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
        scope.populatedItems=[];
        scope.showSearch=false;
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
    generateMultipleSearchFormModels:function(models){
      return {
        models:models,
        lastKeyword:"",
        populate:function(keyword,callback){
          this.lastKeyword=keyword;
          var handlerList=[];
          var individualCallbackHandler=function(model){
            var handler={};
            handler.populatedData=[];
            var singleCallback=function(item){
              handler.populatedData=item;
              iteratePopulatedData();
            };
            model.populate(keyword,singleCallback);
            return handler;
          };
          var iteratePopulatedData=function(){
          var populatedData=[];
            handlerList.forEach(function(handler){
              populatedData=populatedData.concat(handler.populatedData);
              callback(populatedData);
            });
          };
          models.forEach(function(model){
            handlerList.push(individualCallbackHandler(model));
            i++;
          });
        }
      }
    },
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
          lastKeyword:"",
          cancelPreviousRequest:function(){
            this.httpDeferredRequests.forEach(function(req){
              req.reject();
            });
            this.httpDeferredRequests=[];
          },
          populate:function(keyword, callback){
            this.lastKeyword=keyword;
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
                    callback(populatedData);                                          
                  }
                });
                var possibleMore= res.data.length>0;
                if(populatedData.length<t.showLimit && possibleMore && res.paging){                  
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
angular.module('searchPeopleController', ["autocomplete","selectionModel","searchFormModel","facebookService"])
.controller('searchPeopleController', ["$scope","$window","$timeout","peopleSelectionModel", "pageSelectionModel","searchFormModel","facebookService",
  function($scope,$window,$timeout, PeopleSelectionModel,PageSelectionModel,searchFormModel,facebookService) {

   $scope.isSectionVisible=[];
   $scope.isSectionVisible['BASIC']=true;
   $scope.scrollHeight=0;
    $($window).scroll(function() {
        $timeout(function(){
           $scope.scrollHeight=$(document).scrollTop(); 
        });
    });

    $scope.expandedViewStyle=function(){
        return {
            marginTop:$scope.scrollHeight
        };
    };
   $scope.toggleSectionVisible=function(key){
        $scope.isSectionVisible[key]= !$scope.isSectionVisible[key] || false;
   }

   var generatingPlaceLiveCriteria=function(){
        return {
            name:"Live in",
            template:'live.html',
            ignored:false,
            selection:PageSelectionModel.getPlaceLiveSelectionModel()
        };
    };
   var generatingPlaceVisitedCriteria=function(){
        return {
            name:"Visited",
            template:'visited.html',
            ignored:false,
            selection:PageSelectionModel.getPlaceVisitedSelectionModel()
        };
    };
   var generatingLikersCriteria=function(){
        return {
            name:"Likes",
            template:'page.html',
            ignored:false,
            selection:PageSelectionModel.getSearchSelectionModel("/likers")
        };
    };
    var generatingEducationLocationCriteria=function(){      
        var searchModel=searchFormModel.generateSearchFormModel(facebookService,"page",20,20,this.locationBasedSearch);
        return {
            name:"Study in (Location)",
            template:'education.html',
            ignored:false,
            selection:PageSelectionModel.getEducationSelectionModel(searchModel)
        };
    };
    var generatingEducationMajorCriteria=function(){
        var searchModel=searchFormModel.generateSearchFormModel(facebookService, "adeducationmajor",20,20);
        return {
            name:"Study (Major)",
            template:'education.html',
            ignored:false,
            selection:PageSelectionModel.getEducationSelectionModel(searchModel)
        };
    };
    var generatingEducationSchoolCriteria=function(){
        var searchModel=searchFormModel.generateSearchFormModel(facebookService, "adeducationschool",20,20);
        return {
            name:"Study at (School)",
            template:'education.html',
            ignored:false,
            selection:PageSelectionModel.getEducationSelectionModel(searchModel)
        };
    };
    var generatingWorkLocationCriteria=function(){
        var searchModel = searchFormModel.generateSearchFormModel(facebookService,"page",20,20,this.locationBasedSearch);
        return {
            name:"Work in (Location)",
            template:'education.html',
            ignored:false,
            selection:PageSelectionModel.getWorkSelectionModel(searchModel)
        };
    };
    var generatingWorkPositionCriteria=function(){
        var searchModel = searchFormModel.generateSearchFormModel(facebookService, "adworkposition",20,20);
        return {
            name:"Work As (Position)",
            template:'education.html',
            ignored:false,
            selection:PageSelectionModel.getWorkSelectionModel(searchModel)
        };
    };
    var generatingWorkEmployerCriteria=function(){
        var searchModel = searchFormModel.generateSearchFormModel(facebookService, "adworkemployer",20,20);
        return {
            name:"Work At (Employer)",
            template:'education.html',
            ignored:false,
            selection:PageSelectionModel.getWorkSelectionModel(searchModel)
        };
    };
   var generatingGroupsCriteria=function(){
        return {
            name:"Group Member of",
            template:'page.html',
            ignored:true,
            selection:PageSelectionModel.getSearchSelectionModel("/members","group","keywords_groups")
        };
    };

    var placeLiveCriteria=generatingPlaceLiveCriteria();
    var placeVisitedCriteria=generatingPlaceVisitedCriteria();
    
    var likersCriteria=generatingLikersCriteria();

    var educationLocationCriteria=generatingEducationLocationCriteria();
    var educationMajorCriteria=generatingEducationMajorCriteria();
    var educationSchoolCriteria=generatingEducationSchoolCriteria();

    var workLocationCriteria=generatingWorkLocationCriteria();
    var workEmployerCriteria=generatingWorkEmployerCriteria();
    var workPositionCriteria=generatingWorkPositionCriteria();
    
    var groupsCriteria=generatingGroupsCriteria();

    $scope.newtworksCriteriaDropdownSelector=[
        {
            name:"Groups",
            generateCriteria:generatingGroupsCriteria
        }
    ];    

    var interestedInGenderCriteria={
        name:"Interested in",
        template:'interestedin.html',
        ignored:false,
        selection:PeopleSelectionModel.getInterestedInSelectionModel()
    };    
    var religiousViewCriteria = {
        name:"Religious view",
        template:'page.html',
        ignored:false,
        selection:PageSelectionModel.getSearchSelectionModel("/users-religious-view",null,null,PageSelectionModel.religionBasedSearch)
    };
    var politicalViewCriteria = {
        name:"Political view",
        template:'page.html',
        ignored:true,
        selection:PageSelectionModel.getSearchSelectionModel("/users-political-view")
    };
    var relationshipStatusCriteria = {
        name:"Relationship Status",
        template:'relationshipstatus.html',
        ignored:true,
        selection:PeopleSelectionModel.getRelationshipSelectionModel()
    };
    var ageBetweenCriteria = {
        name:"Age between",
        template:'agebetween.html',
        ignored:true,
        selection:PeopleSelectionModel.getAgeSelectionModel()
    };
    var genderCriteria = {
        name:"Gender",
        template:'gender.html',
        ignored:false,
        selection:PeopleSelectionModel.getGenderSelectionModel()
    };
    $scope.basicCriterias=[   
        ageBetweenCriteria,
        genderCriteria,
        relationshipStatusCriteria
    ];

    $scope.extendedCriterias=[
        placeLiveCriteria,
        likersCriteria,
        groupsCriteria,
        interestedInGenderCriteria,
        religiousViewCriteria
    ];

    $scope.educationCriteriaDropdownSelector=[
        {
            name:"Study at (School)",
            generateCriteria:generatingEducationSchoolCriteria
        },
        {
            name:"Study (Major)",
            generateCriteria:generatingEducationMajorCriteria
        },
        {
            name:"Study in (Location)",
            generateCriteria:generatingEducationLocationCriteria
        }
    ];    
    $scope.educationCriterias=[
        educationSchoolCriteria,
        educationMajorCriteria,
        educationLocationCriteria
    ];

    $scope.workCriteriaDropdownSelector=[
        {
            name:"Work at (Employer)",
            generateCriteria:generatingWorkEmployerCriteria
        },
        {
            name:"Work as (Position)",
            generateCriteria:generatingWorkPositionCriteria
        },
        {
            name:"Work in (Location)",
            generateCriteria:generatingWorkLocationCriteria
        }
    ];    
    $scope.workCriterias=[
        workEmployerCriteria,
        workPositionCriteria,
        workLocationCriteria
    ];

    $scope.networksCriterias=[
        groupsCriteria
    ];

    $scope.placeCriteriaDropdownSelector=[
        {
            name:"Live in",
            generateCriteria:generatingPlaceLiveCriteria
        },
        {
            name:"Visited ",
            generateCriteria:generatingPlaceVisitedCriteria
        }
    ];    
    $scope.placeLiveCriterias=[
        placeLiveCriteria,
        placeVisitedCriteria
    ];
    $scope.interestCriteriaDropdownSelector=[
        {
            name:"Likes",
            generateCriteria:generatingLikersCriteria
        }
    ];
    $scope.interestCriterias=[
        likersCriteria,
        interestedInGenderCriteria,
        religiousViewCriteria,
        politicalViewCriteria,
    ];

    $scope.initClone=function(criteriaList,criteria){
        criteria.clone=criteriaList[0];
        $scope.clone(criteria);
    }
    $scope.deleteCriteria=function(criteriaList,itemToBeDeleted){
        var index=criteriaList.indexOf(itemToBeDeleted);
        if(index>=0){
            criteriaList.splice(index,1);
        }
    }
    $scope.addCriteria=function(criteriaList){
        criteriaList.push({deletable:true,clone:null});
    };
    $scope.clone=function(criteria){
        var newCriteria = criteria.clone.generateCriteria();
        criteria.name=newCriteria.name;
        criteria.template=newCriteria.template;
        criteria.ignored=newCriteria.ignored;
        criteria.selection=newCriteria.selection;        
        criteria.deletable=true;
    }
    $scope.activate=function(criteria){
        criteria.ignored=false;
    }

    $scope.unselected=function(criteria){
        criteria.selection.selected=false;
    }
    $scope.isSelected=function(criteria){
        return criteria.selection.selected;
    }
    $scope.expandSelection=function(){
        $scope.expandedMode=true;
    };
    $scope.collapseSelection=function(){
        $scope.expandedMode=false;
    };
    var extendCompose =function(str, criteriaList){
        criteriaList.forEach(function(u){
            if(u.ignored){
                return;
            }
            var  composedString=u.selection.compose();
            if(composedString!=""){
                str+=composedString+"/";
            }
        });
        return str;
    };
    $scope.composeUrl=function(){
        var str="https://www.facebook.com/search/";

        str=extendCompose(str,$scope.basicCriterias);
        if($scope.expandedMode){
            str=extendCompose(str,$scope.placeLiveCriterias);
            str=extendCompose(str,$scope.interestCriterias);
            str=extendCompose(str,$scope.educationCriterias);
            str=extendCompose(str,$scope.workCriterias);
            str=extendCompose(str,$scope.networksCriterias);
        }else{
            str=extendCompose(str,$scope.extendedCriterias);
        }
        str+="intersect";
        $scope.composedUrl=str;
    };
  }
]);


;
angular.module('selectionModel', ["searchFormModel","facebookService"])
.service('pageSelectionModel',["searchFormModel","facebookService",function(searchFormModel,facebookService){
  var handleKeywordValue = function(selection){
    if(!(selection.value && selection.value.id!=undefined) && selection.searchModel.lastKeyword!=undefined && selection.searchModel.lastKeyword!=""){
          selection.value=selection.searchModel.lastKeyword;
          selection.selected=true;
    }
  };

  return {
    locationBasedSearch:function(u){
      var categories=["City","State/province/region","Country","Government Organization"];
      var categoryTypes=["City","State","Province","Region","Country","Government Organization"];
      if(u.category && categories.indexOf(u.category)>=0){
          return true;
      }
      if(u.category_list && u.category_list.length>0 && categoryTypes.indexOf(u.category_list[0])>=0){
          return true;
      }
      return false;
    },
    religionBasedSearch:function(u){
      var categories=["Religion"];
      if(u.category && categories.indexOf(u.category)>=0){
          return true;
      }
      return false;
    },
    getYears:function(){
      var years=[];
      var thisYear=(new Date()).getFullYear();
      for(i=1; i<=100; i++){
        years.push(thisYear-i);
      }
      return years;
    },

    getCommonSearchSelectionModel:function(searchModel){
      return {
        searchModel:searchModel,
        value:null,
        selected:false,
        onSearchItemSelected:function(newValue){
          this.value=newValue;
          this.selected=true;
        },          
        compose:function(){
        }
      };      
    },
    getWorkSelectionModel:function(searchModel){
      if(!searchModel){
        searchModel=searchFormModel.generateMultipleSearchFormModels([
          searchFormModel.generateSearchFormModel(facebookService,"page",20,20,this.locationBasedSearch),
          searchFormModel.generateSearchFormModel(facebookService, "adworkemployer",20,20),
          searchFormModel.generateSearchFormModel(facebookService, "adworkposition",20,20)
        ]);        
      };
      var selectionModel = this.getCommonSearchSelectionModel(searchModel);
      selectionModel.timeFrame="";
      selectionModel.yearOptions=this.getYears();
      selectionModel.year=selectionModel.yearOptions[0];
      selectionModel.compose = function(){
        handleKeywordValue(this);
        if(this.value){
          var keyword="";
          if(this.value.id){
            keyword=this.value.id;
          }else{
            keyword="str/"+this.value+"/keywords_pages";
          }
          if(this.timeFrame=='/date'){
            keyword+="/"+this.year+"/date/employees-2";
          }else{
            keyword+="/employees"+this.timeFrame;
          }
          return keyword;                
        }
        return "";
      };
      return selectionModel;
    },    


    getEducationSelectionModel:function(searchModel){
      if(!searchModel){
        var searchModel=searchFormModel.generateMultipleSearchFormModels([
          searchFormModel.generateSearchFormModel(facebookService,"page",20,20,this.locationBasedSearch),
          searchFormModel.generateSearchFormModel(facebookService, "adeducationschool",20,20),
          searchFormModel.generateSearchFormModel(facebookService, "adeducationmajor",20,20)
        ]);
      };      
      var selectionModel = this.getCommonSearchSelectionModel(searchModel);
      selectionModel.timeFrame="";
      selectionModel.yearOptions=this.getYears();
      selectionModel.year=selectionModel.yearOptions[0];
      selectionModel.compose = function(){
        handleKeywordValue(this);
        if(this.value){
          var keyword="";
          if(this.value.id){
            keyword=this.value.id;
          }else{
            keyword="str/"+this.value+"/keywords_pages";
          }
          if(this.timeFrame=='/date'){
            keyword+="/"+this.year+"/date/students-2";
          }else{
            keyword+="/students"+this.timeFrame;
          }
          return keyword;                
        }
        return "";
      };
      return selectionModel;
    },    
    getPlaceVisitedSelectionModel:function(){
      var searchModel=searchFormModel.generateMultipleSearchFormModels([
          searchFormModel.generateSearchFormModel(facebookService,"page",20,20,this.locationBasedSearch),
          searchFormModel.generateSearchFormModel(facebookService, "place",20,20)
        ]);
      var selectionModel = this.getCommonSearchSelectionModel(searchModel);
      selectionModel.compose = function(){
        handleKeywordValue(this);
        if(this.value){
          var keyword="";
          if(this.value.id){
            keyword=this.value.id;
          }else{
            keyword="str/"+this.value+"/keywords_pages";
          }
          keyword+="/visitors";
          return keyword;                
        }
        return "";
      };
      return selectionModel;
    },
    getPlaceLiveSelectionModel:function(){
      var searchModel = searchFormModel.generateSearchFormModel(facebookService,"page",20,20,this.locationBasedSearch);
      var selectionModel = this.getCommonSearchSelectionModel(searchModel);
      selectionModel.timeFrame="";
      selectionModel.compose = function(){
        handleKeywordValue(this);
        if(this.value){
          var keyword="";
          if(this.value.id){
            keyword=this.value.id;
          }else{
            keyword="str/"+this.value+"/keywords_pages";
          }
          keyword+="/residents"+this.timeFrame;
          return keyword;                
        }
        return "";
      };
      return selectionModel;
    },
    getSearchSelectionModel:function(suffix,queryType,queryTypeKeyword, filterFunc){
      queryTypeKeyword= queryTypeKeyword || "keywords_pages" ;
      queryType=queryType|| "page";
      var searchModel = searchFormModel.generateSearchFormModel(facebookService,queryType,20,20,filterFunc);
      var commonSearchModel = this.getCommonSearchSelectionModel(searchModel);
      commonSearchModel.compose = function(){
        handleKeywordValue(this);
        if(this.value){
          var keyword="";
          if(this.value.id){
            keyword=this.value.id;
          }else{
            keyword="str/"+this.value+"/"+queryTypeKeyword;
          }
          keyword+=suffix;
          return keyword;                
        }
        return "";
      };          
      return commonSearchModel;
    }    
  }
}])
.service('peopleSelectionModel',["searchFormModel","facebookService",function(searchFormModel,facebookService){
  return {
    getRelationshipSelectionModel:function(){
      return {
        value:"",
        compose:function(){
          if(this.value){
            return this.value+"/users";
          }
          return "";
        }
      };
    },
    getPossibleAges:function(){
      var possibleAges=[];
      for(i=1; i<=100; i++){
        possibleAges.push(i);
      }
      return possibleAges;
    },
    getAgeSelectionModel:function(){
      return {
        value:{from:1,to:65},
        compose:function(){
          return this.value.from+"/"+this.value.to+"/users-age-2";
        },
        possibleAges:this.getPossibleAges()
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