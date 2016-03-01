'use strict';

/**
 * Your main application
 */
angular.module('<%= name %>', [
  'ngCookies', 'ngResource', 'ngMessages', 'ngTouch', 'ngPassword', 'ngAnimate', 'ngSanitize',
  'ui.bootstrap', 'ui.router',
  'angular.filter',
  'LocalStorageModule', 
  'angulartics', 'angulartics.google.analytics',
  'matchMedia',
  'pascalprecht.translate',
  'yocto-angular-jwt',
  'toastr'
]);

/**
 * Build state for reponsive change
 *
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 * @param {Object} $window https://docs.angularjs.org/api/ng/service/$window
 * @param {Object} screenSize https://github.com/jacopotarantino/angular-match-media
 */
angular.module('<%= name %>')
.run([ '$rootScope', '$window', 'screenSize',
function ($rootScope, $window, screenSize) {
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
  })
}]);

/**
 * Add lodash to use in in views, ng-repeat="x in _.range(3)" And other init
 *
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 */
angular.module('<%= name %>')
.run([ '$rootScope', function ($rootScope) {
  // assign
  $rootScope._ = window._;
}]);