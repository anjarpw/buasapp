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


