'use strict';

/**
 * Default routes process configuration
 */
angular.module('<%= name %>')
.config([ '$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider',
function ($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {

  // enable HTML 5
  $locationProvider.html5Mode(true);
  // optional trailing slash
  $urlMatcherFactoryProvider.strictMode(false);

  // For any unmatched url
  $urlRouterProvider.otherwise('/');

  /**
   * Set up routes
   */
  $stateProvider.state('default', {
    url : '/',
    templateUrl : 'partials/index'
  });
}]);