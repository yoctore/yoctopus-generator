'use strict';

/**
 * Default application config provider
 */
angular.module('<%= name %>')
.provider('appConstants', [ function () {
  // default config values
  var values = {
    loaded          : false,
    debug           : false,
    loggingUrl      : '',
    translations    : {
      defaultLanguage : 'en_US',
      localeUrl       : '',
      resolveDelay    : 1000,
      locales         : []
    },
    session : {
      delay : 10000
    }
  };

  /**
   * Default configure method
   *
   * @param {Object} cosntant default constant to use
   */
  var configure = function (constants) {
    // extend value
    angular.merge(values, constants);
    // freeze object value with new
    values = Object.freeze(values);
  };

  // default statement
  return {
    /**
     * Default set method, bind on configure method
     */
    set : configure,
    /**
     * An utility method to get data from provider to retreive default data
     */
    keys : function () {
      // default statement
      return values;
    },
    /**
     * Default get method
     *
     * @return {Object} default value constant object
     */
    $get : [ '$http', '$rootScope', function ($http, $rootScope) {
      // Default statement
      return {
        /**
         * Default get keys value
         */
        keys : function () {
          // return values
          return values;
        },
        /**
         * Default load method to retreive data
         */
        load : function () {
          // load config
          $http.get('/config', {
            cache   : true
          }).then(function (data) {
            // set loaded to true
            _.extend(data.data, { loaded : true });
            // set data
            configure(data.data);
            // emit event load ok
            $rootScope.$emit('$configLoadSuccess', data.data);
          }, function (error) {
            // emit error
            $rootScope.$emit('$configLoadError', error);
          });
        }
      }
    }]
  };
}]);

/**
 * Default application transaction manual loader provider
 */
angular.module('<%= name %>')
.provider('appTranslate', [ function () {
  // default translate values
  var values = {
    loaded : false,
    langs : {}
  };

  /**
   * Default configure method
   *
   * @param {Object} cosntant default constant to use
   */
  var configure = function (constants) {
    // extend value
    angular.merge(values, constants);
  };

  // default statement
  return {
    /**
     * Default set method, bind on configure method
     */
    set : configure,
    /**
     * An utility method to get data from provider to retreive default data
     */
    keys : function () {
      // default statement
      return values.langs;
    },
    /**
     * Default get method
     *
     * @return {Object} default value constant object
     */
    $get : [ '$http', 'appConstants', '$rootScope', '$q', 'logService',
    function ($http, appConstants, $rootScope, $q, logService) {
      // Default statement
      return {
        /**
         * Map configure method to change data from another place withour provider scope
         */
        configure : configure,
        /**
         * An utility method to get data from provider to retreive default data
         */
        keys : function () {
          // default statement
          return values.langs;
        },
        /**
         * An utility method to get data from provider to retreive default data
         */
        allKeys : function () {
          // default statement
          return values;
        },
        /**
         * Check if language exist
         */
        has : function (lang) {
          // default statement
          return _.has(this.keys(), lang);
        },
        /**
         * Default load method to retreive data
         */
        load : function (lang) {
          // create an async process
          var deferred = $q.defer();

          // normalize current iso code
          var isoCode = lang || appConstants.keys().translations.defaultLanguage;
          // normalize url
          var url = [ appConstants.keys().translations.localeUrl,
                      isoCode ].join('/').replace('\/\/', '/');

          // is valid url ?
          if (!_.isEmpty(url)) {
            // retreive list of available language
            $http.get(url, {
              cache   : true
            }).then(function (translation) {
              // translations ?
              if (!_.isEmpty(translation.data)) {
                // merge object
                this.configure({ loaded : true, langs : { isoCode : translation.data } });
                // resolve
                deferred.resolve(translation.data);
              } else {
                // log message
                logService.warn([ 'Translations for key [', isoCode, '] are empty' ].join(''));
                // set loaded to true
                this.configure({ loaded : true });
              }
            }.bind(this), function (error) {
              // log message
              logService.error([ 'Cannot load language for key [', isoCode, ']' ].join(''));
              // reject an error occured
              deferred.reject(error);
            });
          }
          // return default promise
          return deferred.promise;
        }
      }
    }]
  };
}]);