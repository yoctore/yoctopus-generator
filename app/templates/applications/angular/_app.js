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
  'pascalprecht.translate'
]);

/**
 * Build state for reponsive change
 */
angular.module('<%= name %>').run([ '$rootScope', '$window', 'screenSize',
function ($rootScope, $window, screenSize) {
  $rootScope.isMobile   = screenSize.is('xs');
  $rootScope.isTablet   = screenSize.is('sm');
  $rootScope.isDesktop  = screenSize.is('md, lg');

  // catch resize action
  angular.element($window).bind('resize', function() {
    $rootScope.isMobile   = screenSize.is('xs');
    $rootScope.isTablet   = screenSize.is('sm');
    $rootScope.isDesktop  = screenSize.is('md, lg');

    // apply
    $rootScope.$apply();
  })
}]);
