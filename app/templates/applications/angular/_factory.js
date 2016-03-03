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

/**
 * Build route for api call with given params
 */
angular.module('<%= name %>')
.factory('apiRouteFactory', [ 'appConstants', '_', function (appConstants, _) {
  // default statement
  return {
    /**
     * Utility method to filter value to retreive on data
     *
     * @param {string} key default key to find
     * @return {Object} wanted item
     */
    get : function (key) {
      // default state of item
      var item = false;
      // check if api keys exists on constants 
      if (appConstants.keys().api) {
        // get api base
        var api   = appConstants.keys().api;
        // get urls
        var urls  = api.urls || [];

        // has requirement
        if (_.isArray(urls) && !_.isEmpty(urls)) {
          // retreive url
          item = _.find(urls, 'name', key);
        }
      }
      // default statement
      return item;
    },
    /**
     * Build And url from given value and rules
     *
     * @param {string} key default key to find
     * @param {Object} rules default rules to map
     * @param {Boolean} prefix true if we must prefix url with api base URl false otherwise
     * @return {String|Boolean} url builded or false in case of failure
     */
    buildUrl : function (url, rules, prefix) {
      // normalize prefix
      prefix  = _.isBoolean(prefix) ? prefix : false;
      // build rules
      rules   = _.isObject(rules) && !_.isEmpty(rules) ? rules : {};

      // check if api keys exists on constants 
      if (appConstants.keys().api) {
        // get api base
        var api   = appConstants.keys().api;
        // url is valid ?
        if (_.isString(url) && !_.isEmpty(url)) {
          // parse all rules and replace
          _.each(rules, function (rule, key) {
            // replace item by chaging by :<keyName> 
            url = url.replace([ ':', key ].join(''), rule);
          });

          // main replace process
          return [ (prefix ? api.baseUrl : '') || '', url ].join('/');
        }
      }
      // default statement
      return false;
    },
    /**
     * Retreive url and build it if needed
     *
     * @param {string} key default key to find
     * @param {Object} rules default rules to map
     * @return {String|Boolean} url builded or false in case of failure
     */
    getUrl : function (key, rules) {
      // retreive item
      var item = this.get(key);

      // item is valid ?
      if (item) {
        // build url
        item = this.buildUrl(item.value, rules, item.api);
      }

      // return invalid statement
      return item;
    }
  };
}]);
