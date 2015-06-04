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