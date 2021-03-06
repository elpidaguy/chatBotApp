var chatBotApp = angular.module('chatBotApp', ['ngRoute']);

chatBotApp.directive('fileModel', ['$parse', function($parse) {
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

    chatBotApp.config(function($sceProvider) {
        $sceProvider.enabled(false);
    });

chatBotApp.config(function($sceProvider) {
    $sceProvider.enabled(false);
});

chatBotApp.config(function($routeProvider) {
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

chatBotApp.controller('homeController', function($scope,$http,$location) 
{
    console.log("in homeController");
    // $scope.userdata = JSON.parse(localStorage.userdata);
    
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

$scope.notice = {};
    $scope.addNotice = function() {
      // console.log($scope.notice)
      if(($scope.notice.title == undefined || !$scope.notice.description == undefined))
      {
        iziToast.error({title: 'Error',message: "Please enter all fields!", position: 'topRight'});
        return;
      }

      $scope.uploadfile();

      $scope.userdata = JSON.parse(localStorage.userdata);
      console.log($scope.notice);
      console.log($scope.noticefile);
      if($scope.noticefile)
      $scope.notice['noitceUrl'] = "http://localhost/chatBotApp/uploads/"+$scope.noticefile['name'];
      $scope.notice['noitceFileType'] = $scope.noticefile['type'];

      $scope.notice['noitceBy'] = $scope.userdata['fname'] + $scope.userdata['lname'];
      $scope.notice['noticeDate'] = new Date();
      var param = JSON.stringify(
        $scope.notice
      );

      console.log(param);

        $http.post("http://localhost:6969/addNotice",param)
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
    }

$scope.notices = [];
    $scope.getNotices = function() {
      $http.get("http://localhost:6969/getNotices")
        .success(function (data) {
            // console.log(data);
            if (data.success == "true") {
              console.log('success');
              $scope.notices = data.notices;
                // iziToast.success({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
                // location.reload();
                // $location.path('login');
              } else {
                iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
            }
        })
        .error(function (err) {
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
        });
    }


$scope.uploadfile = function()
    {
        console.log('in uploadsoExcel');
        var uploadUrl = "http://localhost:6969/uploadfile";
        var file = $scope.noticefile;
        if (file != undefined) {
          var fd = new FormData();
          fd.append('file', file);
  
          $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          })
          .success(function(data) {
  
            if (data.success == "true") {
              iziToast.show({theme: 'dark',title:'Success',message: data.message,position: 'topRight',icon: 'fa fa-user',progressBarColor: 'rgb(0, 255, 184)'});
              file = undefined;
              $scope.noticefile = undefined;
              // location.reload();
              //$('#uploadAmcExcel').modal('hide');
  
            }
            else 
            {
              // waitingDialog.hide();
              // location.reload();
              //$('#uploadAmcExcel').modal('hide');
              iziToast.error({title: 'Error',message: data.message, position: 'topRight'});
              file = undefined;
              $scope.noticefile = undefined;
            }
          })
          .error(function() {
            // waitingDialog.hide();
            iziToast.error({title: 'Error',message: "Server Error !", position: 'topRight'});
            file = undefined;
          });
        }
    }

});


