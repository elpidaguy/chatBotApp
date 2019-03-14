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
    .when('/register', {
      templateUrl : 'views/register.html',
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
    .when('/profile', {
      templateUrl : 'views/profile.html',
      controller : 'homeController'
    })
    .when('/bot', {
      templateUrl : 'views/chatbot.html',
      controller : 'homeController'
    });
});

bidApp.controller('homeController', function($scope,$http,$location) 
{
    console.log("in homeController");
    $scope.userdata = JSON.parse(localStorage.userdata);

    
    $scope.answers = [];
    $scope.questions = [];
    $scope.chatbot = function()
    {
      $scope.flag = true;
      $scope.questions.push(this.question);

      var param  = JSON.stringify(
        this.question
      );
      // console.log(param);

      $http.post("http://localhost:6969/chatbot",param)
        .success(function (data) {
            console.log(data);
            if (data.success == "true") {
              $scope.answers.push(data.response);
              $scope.flag = false;
              $scope.question = "";
              } else {
                iziToast.error({title: 'Error',message: "Something Went Wrong!", position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });

    }



    $scope.login = function()
    {
      var param  = JSON.stringify(
        {
          "username":$scope.username,
          "password":$scope.password,
        }
      );
      // console.log(param);

      $http.post("http://localhost:6969/login",param)
        .success(function (data) {
            console.log(data);
            if (data.success == "true") {
              console.log('success');
                iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
                // location.reload();
                // console.log(data.userdata);
                localStorage.userdata = JSON.stringify(data.userdata);
                $scope.userdata = JSON.parse(localStorage.userdata);
                console.log($scope.userdata);
                $location.path('home');
              } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });

    }


    $scope.reg = {
      'isStaff': false,
    }

    $scope.register = function()
    {

      if($scope.reg.password !== $scope.repassword)
      {
        iziToast.error({title: 'Error',message: "Password Did Not Matched!", position: 'topRight'});
        return;
      }

      console.log('inside submit')
      var param = JSON.stringify(
        $scope.reg
      );

      console.log(param);

        $http.post("http://localhost:6969/register",param)
        .success(function (data) {
            // console.log(data);
            if (data.success == "true") {
              console.log('success');
                iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
                // location.reload();
                $location.path('/');
              } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    };

    $scope.update = function()
    {

      if($scope.userdata.password !== $scope.repassword)
      {
        iziToast.error({title: 'Error',message: "Password Did Not Matched!", position: 'topRight'});
        return;
      }

      console.log('inside submit')
      var param = JSON.stringify(
        $scope.userdata
      );

      console.log(param);

        $http.post("http://localhost:6969/update",param)
        .success(function (data) {
            // console.log(data);
            if (data.success == "true") {
              console.log('success');
                iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
                location.reload();
                // $location.path('login');
              } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    };
});


