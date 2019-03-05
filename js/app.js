var haApp = angular.module('haApp', [ 'nvd3', 'ngAria', 'ngMessages',
		'ngAnimate', 'ngMaterial', 'ngRoute', 'haControllers', 'haServices',
		'ngMaterialDatePicker', 'md.data.table', 'ngSanitize', 'ngMaterialSidemenu' ]);

haApp.config([
		'$routeProvider',
		'$mdThemingProvider',
		function($routeProvider, $mdThemingProvider) {
			// $mdThemingProvider.theme('default').primaryPalette('teal')
			// .accentPalette('red');

			// $mdThemingProvider.theme('default').primaryPalette('pink')
			// .accentPalette('blue');

			// $mdThemingProvider.theme('default').primaryPalette('brown')
			// .accentPalette('orange');

			$mdThemingProvider.theme('default').primaryPalette('indigo')
					.accentPalette('pink');

			$routeProvider.when('/login', {
				templateUrl : 'partials/login.html',
				controller : 'LoginCtrl'
			}).when('/dashboard', {
				templateUrl : 'partials/dashboard.html',
				controller : 'DashboardCtrl'
			}).when('/unregister', {
				templateUrl : 'partials/unregister.html',
				controller : 'UnregisterCtrl'
			}).when('/policing', {
				templateUrl : 'partials/policy.html',
				controller : 'PolicyCtrl'
			}).when('/bandwidth', {
				templateUrl : 'partials/bandwidth.html',
				controller : 'BandwidthCtrl'
			}).when('/register', {
				templateUrl : 'partials/register.html',
				controller : 'RegisterCtrl'
			}).when('/suspend', {
				templateUrl : 'partials/suspend.html',
				controller : 'SuspendCtrl'
			}).when('/reboot', {
				templateUrl : 'partials/reboot.html',
				controller : 'RebootCtrl'
			}).when('/monitor', {
				templateUrl : 'partials/monitor.html',
				controller : 'MonitorCtrl'
			}).when('/dba', {
				templateUrl : 'partials/dba.html',
				controller : 'DBACtrl'
			}).when('/line', {
				templateUrl : 'partials/line.html',
				controller : 'LineCtrl'
			}).when('/service', {
				templateUrl : 'partials/service.html',
				controller : 'ServiceCtrl'
			}).when('/clients', {
				templateUrl : 'partials/clients.html',
				controller : 'ClientsCtrl'
			}).otherwise({
				redirectTo : '/dashboard'
			});
		} ]);

haApp.directive('rzLimit', function() {
	return {
		restrict : 'A',
		require : 'ngModel',
		scope : {
			min : '=rzLimitMin',
			max : '=rzLimitMax'
		},
		link : function($scope, $element, $attrs, ngModel) {
			ngModel.$validators.limit = function(modelValue) {
				return $scope.min <= modelValue && modelValue <= $scope.max;
			};
		}
	};
});

haApp.directive('fileModel', [ '$parse', function($parse) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function() {
				scope.$apply(function() {
					var file = element[0].files[0];
					modelSetter(scope, file);
				});
				scope.uploadFile();
			});
		}
	};
} ]);

haApp.directive('myEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.myEnter);
				});

				event.preventDefault();
			}
		});
	};
});

haApp.directive('focusOn', function($timeout) {
	return {
		restrict : 'A',
		link : function($scope, $element, $attr) {
			$scope.$watch($attr.focusOn, function(_focusVal) {
				$timeout(function() {
					_focusVal ? $element.focus() : $element.blur();
				});
			});
		}
	}
});

haApp.service('fileUpload', [ '$http', function($http) {
	this.uploadFileToUrl = function(file, uploadUrl, onSuccess, onError) {
		var fd = new FormData();
		fd.append('file', file);

		$http.post("http://localhost:8181/queue/dynamicreferences", fd, {
			transformRequest : angular.identity,
			headers : {
				'Content-Type' : undefined,
				"token" : localStorage.remtoken
			}
		}).success(function(result) {
			onSuccess(result);
		}).error(function(error) {
			onError(error);
		});
	}
} ]);

haApp.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
              //Also remove . and , so its gives a cleaner result.
              if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                lastspace = lastspace - 1;
              }
              value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

haApp.filter("toArray", function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});

