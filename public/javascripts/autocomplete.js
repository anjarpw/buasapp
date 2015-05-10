angular.module('autocomplete', [])
.directive("autocomplete",["$timeout","$window",function($timeout,$window){
  return{
    restrict: 'E',
    transclude:true,
    replace:true,
    scope:{
      model:'=',
      onChange:'&',
      onSelected:'&'
    },
    link:function(scope,element,attr){
      var e=$(angular.element(element));

      var input=e.find('input').eq(0);
      var handleKeyDown = function(evt){
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
            handleOnChange();
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
        evt.stopPropagation();
      });
      $($window).click(function(evt){
        $timeout(function(){
          scope.showSearch=false;
        });
      });

      input.keydown(function(evt){
        $timeout(function(){
          handleKeyDown(evt);
        });
      });
      handleOnChange=function(){
        if(scope.onChange){
          scope.showSearch=true;
          var obj={
            searchKeyword:scope.searchKeyword,
            callback:function(result){
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
    template:"<div class='inline-block'>"
              +"<input ng-model='searchKeyword'></input>"
              +"<div class='rel' ng-transclude></div>"+
              "</div>"
  };
}]);