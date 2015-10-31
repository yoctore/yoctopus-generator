/**
 * Default routes process configuration
 */
angular.module('<%= name %>').config([ '$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {
  // For any unmatched url
  $urlRouterProvider.otherwise('/');

  /**
   * Set up routes
   */
  $stateProvider.state('default', {
    url : '/',
    templateUrl : 'partials/index.html'
  });
}]);