'use strict';

/**
 * A translation loader factory to manage translation loading
 *
 * @param {Object} $q https://docs.angularjs.org/api/ng/service/$q
 * @param {Object} appConstants current applications constants
 * @param {Object} $http https://docs.angularjs.org/api/ng/service/$http
 * @param {Object} logService current service for logging
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 * @param {Object} appTranslate current application translate provider
 */
angular.module('<%= name %>')
.factory('translationsLoader',
[ '$q', 'appConstants', '$http', 'logService', '_', '$rootScope', 'appTranslate',
function ($q, appConstants, $http, logService, _, $rootScope, appTranslate) {
  // default statement
  return function (lang) {
    // default async process
    var deferred = $q.defer();

    // has a valid local url ?
    if (!_.isEmpty(appConstants.keys().translations.localeUrl)) {
      // check if langs already exists ?
      if (_.has(appTranslate.keys(), lang.key)) {
        // resolve
        deferred.resolve(appTranslate.keys()[lang.key]);
      } else {
        // load 
        appTranslate.load(lang.key).then(function (langs) {
          // resolve
          deferred.resolve(langs);
        }, function () {
          // log message
          logService.error([ 'An error occured during language loading process for key',
                             lang.key ].join(' '));
          // reject
          deferred.reject(lang.key);
        });
      }
    } else {
      // wait config load success
      $rootScope.$on('$configLoadSuccess', function (event, data) {
        // load
        appTranslate.load(lang.key).then(function (langs) {
          // resolve
          deferred.resolve(langs);
        }, function () {
          // log message
          logService.error([ 'An error occured during language loading process for key',
                             lang.key ].join(' '));
          // reject
          deferred.reject(lang.key);
        });
      });
    }

    // default promise
    return deferred.promise;
  };
}]);
