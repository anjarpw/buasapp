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


