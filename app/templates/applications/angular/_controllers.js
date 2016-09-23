'use strict';

/**
 * Main application controller
 *
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 * @param {Object} logService current service for logging
 * @param {Object} appConstants current applications constants
 * @param {Object} $translate current $translate instance https://angular-translate.github.io/docs/
 * @param {Object} $scope https://docs.angularjs.org/api/ng/type/$rootScope.Scope
 * @param {Object} moment http://momentjs.com/docs/
 */
angular.module('<%= name %>')
.controller('ApplicationController',
[ '$rootScope', 'logService', 'appConstants', '$translate', '$scope', 'moment'
function ($rootScope, logService, appConstants, $translate, $scope, moment) {

  /****************************************************************
   *               DO NOT REMOVE CODES LINES BELOW
   *   WITHOUT THIS PROCESS YOUR CONFIG WAS NOT BE PROPERLY BUILD
   ****************************************************************/

  // default languages list
  $scope.languages = [];

  // on failed ?
  $rootScope.$on('$configLoadSuccess', function (event, data) {
    // keep safe language before process
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
    // set moment locale
    moment.locale(appConstants.keys().locale);
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
}]);

/*******************************************************************
 *                       TRANSLATE PART
 *******************************************************************/

/**
 * Default translate controller to manage lang
 *
 * @param {Object} $translate current $translate instance https://angular-translate.github.io/docs/
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} $scope https://docs.angularjs.org/api/ng/type/$rootScope.Scope
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 */
angular.module('<%= name %>')
.controller('TranslateController', [ '$translate' , '_', '$scope', '$rootScope',
function ($translate, _, $scope, $rootScope) {
  /**
   * return state to check if current lang is selected lang
   *
   * @return {Boolean} true if match false otherwise
   */
  $scope.isActive = function (lang) {
    // default statement
    return $translate.use() === lang;
  }

  /**
   * Default method to change language
   *
   * @param {String} lang current lang to use
   */
  $scope.changeLanguage = function (lang) {
    // is valid ?
    if (_.isString(lang) && !_.isEmpty(lang)) {
      // use language
      $translate.use(lang);
    }
  };

  /**
   * Watch the $translateChangeEnd event
   */
  $rootScope.$on('$translateChangeEnd', function () {
    // Broadcast the change translate
    $scope.$broadcast('$translate.change');
  });
}]);

