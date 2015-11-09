'use strict';

/**
 * Default routes process configuration
 */
angular.module('<%= name %>')
.config([ '$stateProvider', '$urlRouterProvider', '$locationProvider',
function ($stateProvider, $urlRouterProvider, $locationProvider) {
  // enable HTML 5
  $locationProvider.html5Mode(true);

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