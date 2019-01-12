var bidApp = angular.module('bidApp', ['ngRoute']);

bidApp.directive('fileModel', ['$parse', function($parse) {
 return {
  restrict: 'A',
  link: function(scope, element, attrs) {
   var model = $parse(attrs.fileModel);
   var modelSetter = model.assign;

   element.bind('change', function() {
    scope.$apply(function() {
      console.log(attrs.fileModel);

     modelSetter(scope, element[0].files[0]);
     /*if (attrs.fileModel == "amcExcelFile") {
      scope.uploadAmcExcel();    
     }*/
    });
   });
  }
 };
}]);

bidApp.directive('stSelectDistinct', [function() {
      return {
        restrict: 'E',
        require: '^stTable',
        scope: {
          collection: '=',
          predicate: '@',
          predicateExpression: '='
        },
        template: '<select ng-model="selectedOption" ng-change="optionChanged(selectedOption)" ng-options="opt for opt in distinctItems"></select>',
        link: function(scope, element, attr, table) {
          var getPredicate = function() {
            var predicate = scope.predicate;
            if (!predicate && scope.predicateExpression) {
              predicate = scope.predicateExpression;
            }
            return predicate;
          }

          scope.$watch('collection', function(newValue) {
            var predicate = getPredicate();

            if (newValue) {
              var temp = [];
              scope.distinctItems = ['All'];

              angular.forEach(scope.collection, function(item) {

                var value = item[predicate].toString();                

                if (value && value.trim().length > 0 && temp.indexOf(value) === -1) {
                  temp.push(value.toString());
                }
              });
              temp.sort();

              scope.distinctItems = scope.distinctItems.concat(temp);
              scope.selectedOption = scope.distinctItems[0];
              scope.optionChanged(scope.selectedOption);
            }
          }, true);

          scope.optionChanged = function(selectedOption) {
            var predicate = getPredicate();

            var query = {};

            query.distinct = selectedOption;

            if (query.distinct === 'All') {
              query.distinct = '';
            }

            table.search(query, predicate);
          };
        }
      }
    }]);
    



bidApp.filter('unique', function() {
    return function (arr, field) {
        console.log(field);
        var o = {}, i, l = arr.length, r = [];
        for(i=0; i<l;i+=1) {
            o[arr[i][field]] = arr[i];
        }
        for(i in o) {
            r.push(o[i]);
        }

/*        console.log(r);
*/        return r;
    };
  });


bidApp.filter('customFilter', ['$filter', function($filter) {
      var filterFilter = $filter('filter');
      var standardComparator = function standardComparator(obj, text) {
        text = ('' + text).toLowerCase();
        return ('' + obj).toLowerCase().indexOf(text) > -1;
      };

      return function customFilter(array, expression) {
        function customComparator(actual, expected) {

          var isBeforeActivated = expected.before;
          var isAfterActivated = expected.after;
          var isLower = expected.lower;
          var isHigher = expected.higher;
          var higherLimit;
          var lowerLimit;
          var itemDate;
          var queryDate;

          if (angular.isObject(expected)) {
            //exact match
            if (expected.distinct) {
              if (!actual || actual.toLowerCase() !== expected.distinct.toLowerCase()) {
                return false;
              }

              return true;
            }

            //matchAny
            if (expected.matchAny) {
              if (expected.matchAny.all) {
                return true;
              }

              if (!actual) {
                return false;
              }

              for (var i = 0; i < expected.matchAny.items.length; i++) {
                if (actual.toLowerCase() === expected.matchAny.items[i].toLowerCase()) {
                  return true;
                }
              }

              return false;
            }

            //date range
            if (expected.before || expected.after) {
              try {
                if (isBeforeActivated) {
                  higherLimit = expected.before;

                  itemDate = new Date(actual);
                  queryDate = new Date(higherLimit);

                  if (itemDate > queryDate) {
                    return false;
                  }
                }

                if (isAfterActivated) {
                  lowerLimit = expected.after;


                  itemDate = new Date(actual);
                  queryDate = new Date(lowerLimit);

                  if (itemDate < queryDate) {
                    return false;
                  }
                }

                return true;
              } catch (e) {
                return false;
              }

            } else if (isLower || isHigher) {
              //number range
              if (isLower) {
                higherLimit = expected.lower;

                if (actual > higherLimit) {
                  return false;
                }
              }

              if (isHigher) {
                lowerLimit = expected.higher;
                if (actual < lowerLimit) {
                  return false;
                }
              }

              return true;
            }
            //etc

            return true;

          }
          return standardComparator(actual, expected);
        }

        var output = filterFilter(array, expression, customComparator);
        return output;
      };
    }]);

bidApp.filter('titlecase', function() {
     return function(input) {
      var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

      input = input.toLowerCase();
      return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
       if (index > 0 && index + match.length !== title.length &&
        match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
        (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
        title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase();
       }

       if (match.substr(1).search(/[A-Z]|\../) > -1) {
        return match;
       }

       return match.charAt(0).toUpperCase() + match.substr(1);
      });
     }
    });

    bidApp.config(function($sceProvider) {
        $sceProvider.enabled(false);
    });

bidApp.config(function($sceProvider) {
    $sceProvider.enabled(false);
});

bidApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl : 'login.html',
        controller : 'homeController'
    })
    .when('/home', {
        templateUrl : 'views/home.html',
        controller : 'homeController'
    })
    .when('/notices', {
        templateUrl : 'views/notices.html',
        controller : 'homeController'
    })
    .when('/categories', {
      templateUrl : 'views/admin/categories.html',
      controller : 'homeController'
    })
    .when('/listUsers', {
      templateUrl : 'views/admin/listUsers.html',
      controller : 'homeController'
    })
    .when('/listProblems', {
      templateUrl : 'views/admin/listProblems.html',
      controller : 'homeController'
    });
});

bidApp.controller('homeController', function($scope,$http,$route,$templateCache,$window,$location,$timeout,$filter,$rootScope) 
{
    console.log("in homeController");


    $scope.reg = {}

    $scope.submitReg = function()
    {
      // console.log('inside submit')
      $scope.reg.cat = JSON.parse($scope.reg.cat)
      var param = JSON.stringify(
        $scope.reg
      );

      console.log(param);

        $http.post("http://localhost:5555/addServiceProvider",param)
        .success(function (data) {
            // console.log(data);
            if (data.success == "true") {
              console.log('success');
                iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
                // location.reload();
                $location.path('listUsers');
              } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    };

    $scope.getSPDetail = function(id)
    {
      $scope.spDetail = [];
      $scope.spDetail = $scope.spList.find(x => x._id === id);
    }

    $scope.getSPList = function() {
      $http.post("http://localhost:5555/getSPList")
      .success(function (data) {
          console.log(data);
          if (data.success == "true") {
            console.log('success');
            $scope.spList = data.spList;
              // iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
          } else {
              iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
          }
      })
      .error(function (err) {
          iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
      });
  }

    $scope.getCatList = function() {
        $http.post("http://localhost:5555/catlist")
        .success(function (data) {
            console.log(data);
            if (data.success == "true") {
              console.log('success');
              $scope.catList = data.catlist;
                // iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
            } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    }

    $scope.getCount = function() {
      $http.post("http://localhost:5555/getCount")
      .success(function (data) {
          console.log(data);
          if (data.success == "true") {
            console.log('success');
            $scope.count = data.count;
              // iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
          } else {
              iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
          }
      })
      .error(function (err) {
          iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
      });
  }

    $scope.getSubCatList = function() {
      $http.post("http://localhost:5555/subcatlist")
      .success(function (data) {
          console.log(data);
          if (data.success == "true") {
            console.log('success');
            $scope.subcatlist = data.subcatlist;
              // iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
          } else {
              iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
          }
      })
      .error(function (err) {
          iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
      });
  }

    $scope.getUserList = function()
    {
      $http.post("http://localhost:5555/getuserlist")
        .success(function (data) {
            console.log(data);
            if (data.success == "true") {
              console.log('success');
              $scope.userList = data.userlist;
                // iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
            } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    }

    $scope.subcategory = [];
    $scope.addNewSubcategory = function()
    {
      // console.log($scope.subcategory);

      $scope.subcategory.catData = JSON.parse($scope.subcategory.catData);
      
      var param = JSON.stringify(
        {
          "catId":$scope.subcategory.catData.ID,
          "catName":$scope.subcategory.catData.catName,
          "subCatName":$scope.subcategory.subcatName
        }
      )

      $http.post('http://localhost:5555/addsubcat',param)
        .success(function (data) {
          if(data.success == 'true')
          {
            iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
            location.reload();
          }
          else{
            iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            location.reload();  
          }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    }






    //Update Functions
    $scope.updateSP = function()
    {
      var param = JSON.stringify(
        $scope.spDetail
      )

      $http.post('http://localhost:5555/updateSP',param)
        .success(function (data) {
          if(data.success == 'true')
          {
            iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
            location.reload();
          }
          else{
            iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            location.reload();  
          }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    }

    $scope.getCatDetail = function(id)
    {
      $scope.subCatDetail = [];
      $scope.subCatDetail = $scope.subcatlist.find(x => x.subCatName === id);
    }

    $scope.editsubcategory = function()
    {
      var param = JSON.stringify(
        $scope.subCatDetail
      )

      $http.post('http://localhost:5555/updateSubCat',param)
        .success(function (data) {
          if(data.success == 'true')
          {
            iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
            location.reload();
          }
          else{
            iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            location.reload();  
          }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    }


    //Delete Functions
    $scope.deleteSP = function(id)
    {
      if(confirm('Do you really want to delete this Service Provider?'))
      {
        var param = JSON.stringify(
          {'_id': id}
        )
  
        $http.post('http://localhost:5555/deleteSP',param)
          .success(function (data) {
            if(data.success == 'true')
            {
              iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
              location.reload();
            }
            else{
              iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
              location.reload();  
            }
          })
          .error(function (err) {
              iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
          });
      }
    }

});


