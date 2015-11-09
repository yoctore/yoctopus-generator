'use strict';
/**
 * Main application controller
 */
angular.module('<%= name %>')
.controller('ApplicationController',
[ '$rootScope', 'logService', 'appConstants', '$translate', '$scope',
function ($rootScope, logService, appConstants, $translate, $scope) {

  /****************************************************************
   *               DO NOT REMOVE CODES LINES BELOW
   *   WITHOUT THIS PROCESS YOUR CONFIG WAS NOT BE PROPERLY BUILD
   ****************************************************************/

  // default languages list
  $scope.languages = [];

  // on failed ?
  $rootScope.$on('$configLoadSuccess', function (event, data) {
    // keep safe language before process
    //console.log(appConstants.keys().translations);
    var languages = appConstants.keys().translations.locales;
    // parse languages list
    _.each(languages, function (locale, key) {
      languages[key] = { 
        isoCode : locale,
        label   : [ 'LANG', locale.toUpperCase(), 'LABEL' ] .join('_')
      };
    });
    // change languages assignation
    $scope.languages = languages;
  });

  // on failed ?
  $rootScope.$on('$configLoadError', function (event, data) {
    // default message
    var message = 'Cannot retreive configurations for current application. Cannot continue.';
    // log error
    logService.error(message);
    // broadcast message
    $rootScope.$broadcast('$applicationCritialError', message);
  });

  // success translate loading
  $rootScope.$on('$translateLoadingSuccess', function () {
    // broadcast message
    $rootScope.$broadcast('$applicationIsReady');
  });

  // error message fon translate 
  $rootScope.$on('$translateLoadingError', function () {
    // default message
    var message = 'Cannot retreive translations for current application. Cannot continue.';
    // log error
    logService.error(message);
    // broadcast message
    $rootScope.$broadcast('$applicationCritialError', message);
  });

  // load config
  appConstants.load();

  /*******************************************************************
   *                       TRANSLATE PART
   *******************************************************************/

  /**
   * Default method to change language
   */
  $scope.changeLanguage = function (lang) {
    // is valid ?
    if (_.isString(lang) && !_.isEmpty(lang)) {
      // use language
      $translate.use(lang);
    }
  };
}]);
