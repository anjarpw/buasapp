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


