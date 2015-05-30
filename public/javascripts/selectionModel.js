angular.module('selectionModel', ["searchFormModel","facebookService"])
.service('pageSelectionModel',["searchFormModel","facebookService",function(searchFormModel,facebookService){
  return {
    getSearchSelectionModel:function(suffix,queryType,queryTypeKeyword, filterFunc){
      queryTypeKeyword= queryTypeKeyword || "keywords_pages" ;
      queryType=queryType|| "page";
      return {
        searchModel:searchFormModel.generateSearchFormModel(facebookService,queryType,20,20,filterFunc),
        value:null,
        selected:false,
        onSearchItemSelected:function(newValue){
          this.value=newValue;
          this.selected=true;
        },          
        compose:function(){
          if(!this.value && this.searchModel.lastKeyword!=""){
            this.value=this.searchModel.lastKeyword;
            this.selected=true;
          }
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
        }          
      };        
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
      for(i=1; i<=100; i++){
        possibleAges.push(i);
      }
      return {
        value:{from:1,to:65},
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