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
          lastKeyword:"",
          cancelPreviousRequest:function(){
            this.httpDeferredRequests.forEach(function(req){
              req.reject();
            });
            this.httpDeferredRequests=[];
          },
          populate:function(keyword, callback){
            this.lastKeyword=keyword;
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
})