/**
 * Default translate controller
 */
angular.module('<%= name %>').controller('TranslateController', [ '$translate', '$scope',
function ($translate, $scope) {
  /**
   * Default method to change language
   */
  $scope.changeLanguage = function (langKey) {
    // use language
    $translate.use(langKey);
  };
}]);