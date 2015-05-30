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
   var generatingPlaceLiveCriteria=function(){
        return {
            name:"Live in",
            template:'place.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/residents",null,null,locationBasedSearch)
        };
    };
   var generatingLikersCriteria=function(){
        return {
            name:"Likes",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/likers")
        };
    };
    var generatingWorkPastCriteria=function(){
        return {
            name:"Work at / as / in",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/employees/past")
        };
    };
    var generatingWorkPresentCriteria=function(){
        return {
            name:"Working at / as",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/employees/present")
        };
    };
    var generatingStudentPastCriteria=function(){
        return {
            name:"Studied at/as/in",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/students/past")
        };
    };
    var generatingStudentPresentCriteria=function(){
        return {
            name:"Studying at/as/in",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/students/present")
        };
    };
    var generatingEmployeePastCriteria=function(){
        return {
            name:"Worked at/as/in",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/employees/past")
        };
    };
    var generatingEmployeePresentCriteria=function(){
        return {
            name:"Working at/as/in",
            template:'page.html',
            ignored:false,
            selected:false,
            selection:PageSelectionModel.getSearchSelectionModel("/employees/present")
        };
    };


    var placeLiveCriteria=generatingPlaceLiveCriteria();
    var studentPresentCriteria=generatingStudentPresentCriteria();
    var studentPastCriteria=generatingStudentPastCriteria();
    var employeePresentCriteria=generatingEmployeePresentCriteria();
    var employeePastCriteria=generatingEmployeePastCriteria();
    var likersCriteria=generatingLikersCriteria();
    var groupsCriteria={
        name:"Group Member of",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.getSearchSelectionModel("/members","group","keywords_groups")
    };
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
        selected:false,
        selection:PageSelectionModel.getSearchSelectionModel("/users-religious-view")
    };
    var politicalViewCriteria = {
        name:"Political view",
        template:'page.html',
        ignored:false,
        selected:false,
        selection:PageSelectionModel.getSearchSelectionModel("/users-political-view")
    };
    var relationshipStatusCriteria = {
        name:"Relationship Status",
        template:'relationshipstatus.html',
        ignored:false,
        selected:false,
        selection:PeopleSelectionModel.getRelationshipSelectionModel()
    };
    var ageBetweenCriteria = {
        name:"Age between",
        template:'agebetween.html',
        ignored:false,
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
        religiousViewCriteria,
        relationshipStatusCriteria
    ];

    $scope.studentCriteriaDropdownSelector=[
        {
            name:"Studied at/as/in",
            generateCriteria:generatingStudentPastCriteria
        },
        {
            name:"Studying at/as/in",
            generateCriteria:generatingStudentPresentCriteria
        }
    ];    
    $scope.studentCriterias=[
        studentPastCriteria,
        studentPresentCriteria
    ];

    $scope.employeeCriteriaDropdownSelector=[
        {
            name:"Worked at/as/in",
            generateCriteria:generatingEmployeePastCriteria
        },
        {
            name:"Working at/as/in",
            generateCriteria:generatingEmployeePresentCriteria
        }
    ];    
    $scope.employeeCriterias=[
        employeePastCriteria,
        employeePresentCriteria
    ];


    $scope.placeCriteriaDropdownSelector=[
        {
            name:"Live in",
            generateCriteria:generatingPlaceLiveCriteria
        }
    ];    
    $scope.placeLiveCriterias=[
        placeLiveCriteria
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
        criteria.selected=newCriteria.selected;
        criteria.selection=newCriteria.selection;        
        criteria.deletable=true;
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
            str=extendCompose(str,$scope.placeCriterias);
            str=extendCompose(str,$scope.interestCriterias);
            str=extendCompose(str,$scope.studentCriterias);
            str=extendCompose(str,$scope.employeeCriterias);
        }else{
            str=extendCompose(str,$scope.extendedCriterias);
        }
        str+="intersect";
        $scope.composedUrl=str;
    };
  }
]);


