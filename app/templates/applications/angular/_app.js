'use strict';

/**
 * Your main application
 */
angular.module('<%= name %>', [
  'ngCookies', 'ngResource', 'ngMessages', 'ngTouch',
  'ngPassword', 'ngAnimate', 'ngSanitize', 'ngMockE2E',
  'ui.bootstrap', 'ui.router',
  'angular.filter', 'yocto-angular-jwt',
  'LocalStorageModule', 
  'angulartics', 'angulartics.google.analytics',
  'matchMedia', 'angular-preload-image',
  'com.2fdevs.videogular', 'com.2fdevs.videogular.plugins.poster',
  'pascalprecht.translate', 'infinite-scroll',
  'toastr', 'ncy-angular-breadcrumb', 'angular-cookie-law'
]);

/**
 * Build state for reponsive change
 *
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 * @param {Object} $window https://docs.angularjs.org/api/ng/service/$window
 * @param {Object} screenSize https://github.com/jacopotarantino/angular-match-media
 * @param {Object} mockService internal mock service for debug requests
 * @param {Object} appConstants default app constants module
 * @param {Object} $interval https://docs.angularjs.org/api/ng/service/$interval
 * @param {Object} localhostStorageService https://github.com/grevory/angular-local-storage
 */
angular.module('<%= name %>')
.run([ '$rootScope', '$window', 'screenSize', 'mockService',
'appConstants', '$interval', 'localStorageService',
function ($rootScope, $window, screenSize, mockService,
appConstants, $interval,localStorageService) {

  // Remove the locaStorage x-jwt-token
  localStorageService.remove('x-jwt-token');

  $rootScope.isMobile   = screenSize.is('xs');
  $rootScope.isTablet   = screenSize.is('sm');
  $rootScope.isDesktop  = screenSize.is('md, lg');

  // catch resize action
  angular.element($window).bind('resize', function () {
    $rootScope.isMobile   = screenSize.is('xs');
    $rootScope.isTablet   = screenSize.is('sm');
    $rootScope.isDesktop  = screenSize.is('md, lg');

    // apply
    $rootScope.$apply();

    // Launch the $resize.window event
    $rootScope.$broadcast('$resize.window');
  });

  // catch reload action
  angular.element($window).bind('beforeunload', function (event) {
    $rootScope.$broadcast('$reload.window', event);
  });

  // detect scroll on page
  angular.element($window).bind('scroll', function (event) {
    $rootScope.$broadcast('$page.scroll', event);
  });

  // Add lodash to use in in views, ng-repeat="x in _.range(3)" And other init
  $rootScope._ = window._;

  // Build Default routes
  mockService.buildDefaultRoutes();

  // Interval for check the key mock
  var mockInterval = $interval(function () {
    // Check if the appConstants keys is loaded
    if (appConstants.keys().loaded) {
      // Stock the appConstants.keys().mock in activeMock var
      var activeMock = appConstants.keys().mock;
      // Build $httpBackend routes & exception routes
      mockService.build(activeMock);
      // Remove the mockInterval
      $interval.cancel(mockInterval);
    }
  }, 10);
}]);
