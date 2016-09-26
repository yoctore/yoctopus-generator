'use strict';

/**
 * A Logger utility service
 *
 * @param {Object} $log https://docs.angularjs.org/api/ngMock/service/$log
 * @param {Object} appConstants current applications constants
 * @param {Object} $http https://docs.angularjs.org/api/ng/service/$http
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} $location https://docs.angularjs.org/api/ng/service/$location
 */
angular.module('<%= name %>')
.service('logService', [ '$log', 'appConstants', '$http', '_', '$location',
function ($log, appConstants, $http, _, $location) {
  // default statement
  return {
    /**
     * Default notify service
     */
    notify : function (message, type) {
      // Get logging url
      var url = appConstants.keys().loggingUrl;
      // is string ?
      if (!_.isUndefined(url) && _.isString(url) && !_.isEmpty(url)) {
        // send message on server
        $http.post(appConstants.keys().loggingUrl, {
          message  : [ [ '[', $location.path(), ']' ].join(' '), message ].join(' - '),
          type     : type
        });
      } else {
        // default log message
        this.log('Cannot notify. Remote logging url is not defined.');
      }
    },
    /**
     * Write a log message
     */
    log : function (message) {
      // only if debug is activated
      if (appConstants.keys().debug) {
        // default log process
        $log.log(message);
      }
    },
    /**
     * Write an information message
     */
    info : function (message) {
      // only if debug is activated
      if (appConstants.keys().debug) {
        // default log process
        $log.info(message);
      }
    },
    /**
     * Write an warn message
     */
    warn : function (message) {
      // process notify
      this.notify(message, 'warning');
      // only if debug is activated
      if (appConstants.keys().debug) {
        // default log process
        $log.warn(message);
      }
    },
    /**
     * Write an warn message
     */
    error : function (message) {
      // process notify
      this.notify(message, 'error');
      // only if debug is activated
      if (appConstants.keys().debug) {
        // default log process
        $log.error(message);
      }
    },
    /**
     * Write an warn message
     */
    debug : function (message) {
      // only if debug is activated
      if (appConstants.keys().debug) {
        // default log process
        $log.debug(message);
      }
    }
  };
}]);

/**
 * Valid all given Http reponse for current application
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} logService current service for logging
 */
angular.module('<%= name %>')
.service('httpResponse', [ '_', 'logService',
function (_, logService) {
  // Default statement
  return {
    /**
     * Check if http reponse is valid
     *
     * @param {Object} response http response
     * @rerurn {Boolean} true if all is ok false otherwise
     */
    isValid : function (response) {
      // check is a valid http status
      if (response.status === 200) {
        // save data
        var data = response.data;
        // has a correct format ?
        if (_.has(data, 'status') && _.has(data, 'code') && _.has(data, 'message')) {
          // is a correct prefix ?
          if (data.status === 'success' && _.startsWith(data.code.toString(), '200')) {
            // valid statement
            return true;
          }
        }
      }

      // if we are here log error or warn
      logService.warn( [ 'An error occured during http response validation for :',
                            JSON.stringify(response.data) ].join(' '));

      // default statement
      return false;
    },
    /**
     * Check if http reponse is on error
     *
     * @param {Object} response http response
     * @rerurn {Boolean} true if all is on error false otherwise
     */
    isError : function (response) {
      // default statement
      return !this.isValid(response);
    }
  };
}]);

/**
 * Process all http call on given service for current application
 *
 * @param {Object} $http https://docs.angularjs.org/api/ng/service/$http
 * @param {Object} $q https://docs.angularjs.org/api/ng/service/$q
 * @param {Object} appConstants current applications constants
 * @param {Object} apiRouteFactory current apiRoute factory to build api url
 * @param {Object} logService current service for logging
 * @param {Object} httpService current application http service to process http request
 * @param {Object} localStorageServiceProvider https://github.com/grevory/angular-local-storage
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.service('httpService', [ '$http', '$q', 'appConstants', 'apiRouteFactory',
'logService', 'httpResponse', 'localStorageService', 'cryptoService', '_',
function ($http, $q, appConstants, apiRouteFactory, logService, httpResponse,
localStorageService, cryptoService, _) {
  // default statement
  return {
    /**
     * Default process to send an http query
     *
     * @param {String} key key to use to retreive url to call
     * @param {Object} properties data to map on retreive url
     * @param {Object} config extra config to add on http method
     */
    process : function (key, properties, config) {
      // normalize properties
      properties    = _.isObject(properties) ? properties : {};

      // normalize config
      config        = _.isObject(config) ? config : {};

      // create async process
      var deferred  = $q.defer();
      // retreive url
      var item      = apiRouteFactory.get(key);

      // is a valid item ?
      if (item) {
        // mixed process
        _.set(config, 'url', apiRouteFactory.getUrl(key, properties, item.api ? false : item.api));
        _.set(config, 'method', item.type ? item.type.toUpperCase() : false);

        // config is valid ?
        if (_.isString(config.url) && !_.isEmpty(config.url) &&
            _.includes([ 'GET', 'HEAD', 'POST','PUT', 'DELETE', 'JSONP', 'PATCH' ],
            config.method)) {

          // tricks for interval api call server to server
          if (item.api) {
            // replace config object
            config = {
              url     : '/api',
              method  : 'POST',
              data    : {
                url     : config.url,
                data    : config.data,
                method  : config.method
              }
            }
          }

          // get user first
          var user = localStorageService.get('user');

          // has user ? so decrypt
          if (!_.isNull(user)) {
            // get user
            user = cryptoService.decrypt(user);

            // has user id ?
            if (_.has(user, 'id') && _.isString(user.id) && !_.isEmpty(user.id)) {
              // overload header to send user id on request
              config.headers = {
                'x-origin-id' : user.id
              }
            }
          }

          // process http config
          $http(config).then(function (success) {
            // is valid ?
            if (httpResponse.isValid(success)) {
              // resolve
              deferred.resolve(success.data.data);
            } else {
              // reject
              deferred.reject(success.data.code);
            }
          }, function (error) {
            // log error
            logService.error([ 'An error occured during an http action with error :',
                               JSON.stringify(error) ].join(' '));
            // reject
            deferred.reject(error);
          });
        } else {
          // warn message
          logService.warn([ 'Cannot process request http config is invalid for config :',
                               JSON.stringify(config) ].join(' '));
          // reject
          deferred.reject();
        }
      } else {
        // warn message
        logService.warn([ 'Cannot get url for given key [', key, ']' ].join(' '));
        // reject
        deferred.reject();
      }

      // default promise
      return deferred.promise;
    }
  };
}]);

/**
 * An utility service to retrieve information about user
 *
 * @param {Object} localStorageServiceProvider https://github.com/grevory/angular-local-storage
 * @param {Object} httpService current application http service to process http request
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 * @param {Object} $cookies https://docs.angularjs.org/api/ngCookies/service/$cookies
 * @param {Object} logService current service for logging
 * @param {Object} moment http://momentjs.com/docs/
 * @param {Object} cryptoService utility service to encrypt & decrypt data with dynamic shared key
 * @param {Object} ACLFactory a factory to build rights for user
 */
angular.module('<%= name %>')
.service('userInformationsService',
[ 'localStorageService', 'httpService', '$rootScope', '$cookies', 'logService',
'moment', 'cryptoService',
function (localStorageService, httpService, $rootScope, $cookies, logService,
moment, cryptoService) {
  /**
   * Default callback when event change
   */
  var changeEventCallback = function () {
    // broadcast event change
    $rootScope.$broadcast('$userInformationsService.change', localStorageService.get('user'));
  };

  // default statement
  return {
    /**
     * Default method to init to cookie value
     */
    init : function () {
      // retreive session
      httpService.process('getSession').then(function (data) {
        // if success ?
        if (data && _.has(data, 'id')) {
          // add use item
          this.set(data);

          // load user info
          this.loadUserInfo();
        }
      }.bind(this), function (error) {
        // log error
        logService.error([ 'Cannot get session for current user :',
                           JSON.stringify(error)
                         ].join(' '));
      });
    },
    /**
     * Clean user information on localstorage
     *
     * @return {Boolean} true on succeed, failed otherwise
     */
    clear : function () {
      // remove all keys
      return localStorageService.clearAll();
    },
    /**
     * Check if current user session is active
     */
    checkSessionExistence : function () {
      // send request to check if session is already active
      httpService.process('sessionIsActive').then(function (state) {
        // broadcast event 
        $rootScope.$broadcast(state.data.activity ? '$session.valid' : '$session.invalid');
      }, function (error) {
        // log error
        logService.error([ 'Cannot get session connectivity for current user :',
                          JSON.stringify(error)
                         ].join(' '));
        // broadcast event 
        $rootScope.$broadcast('$session.invalid');
      });
    },
    /**
     * Default function to load user information
     */
    loadUserInfo : function () {
      // get data
      var user = this.get();
      // is connected
      if (this.isConnected()) {
        // retreive user info
        httpService.process('getUserInfos', { id : user.id }).then(function (success) {
          // if success ?
          if (success) {
            // YOUR CODE HERE
            console.log('Log user info succeed. Please provide code on service.js ligne 349');
            // broadcast event 
            $rootScope.$broadcast('$session.valid');
          }
        }.bind(this), function (error) {
          // log error
          logService.error([ 'Cannot load user information :', JSON.stringify(error) ].join(' '));
        });
      } else {
        // broadcast event 
        $rootScope.$broadcast('$session.invalid');
      }
    },
    /**
     * Default utilitu method to define if user is connected
     *
     * @return {Boolean} true if is connected false otherwise
     */
    isConnected : function () {
      // default statement
      return !_.isNull(this.get());
    },
    /**
     * Default method to retreive information about current user
     */
    get : function () {
      // get user first
      var user = localStorageService.get('user');

      // has user ? so decrypt
      if (!_.isNull(user)) {
        user = cryptoService.decrypt(user);
      }

      // default statement
      return user;
    },
    /**
     * Default method to set user data on localStorage
     *
     * @param {Object} value default value to use for user
     * @return {Boolean} default statement
     */
    set : function (value) {
      // default statement
      return localStorageService.set('user', cryptoService.encrypt(value));
    },
    /**
     * An utility method to listen event and brodcast change on change
     */
    listenAndBroadcast : function () {
      // list of evvent
      var events = [ 'LocalStorageModule.notification.setitem',
                     'LocalStorageModule.notification.removeitem' ];
      // parse all events
      _.each(events, function (event) {
        // listen change
        $rootScope.$on(event, changeEventCallback);
      });
    },
    /**
     * Utility method to get profile type on current user object
     *
     * @return {String|Boolean} a string if all is ok false otherwise
     */
    getProfileType : function () {
      // is conncted
      if (this.isConnected()) {
        // get default profile value
        return _.get(this.get(), 'profile');
      }

      // invalid state
      return false;
    },
    /**
     * destroy the cookie Session
     */
    destroySession : function () {
      // destroySession
      httpService.process('destroySession').then(function () {
        // call default callback 
        changeEventCallback();
      }, function (error) {
        logService.error([ 'Cannot destroy user session :', JSON.stringify(error) ].join(' '));
      });
    }
  }
}]);

/**
 * Utility service to crypt data in app
 *
 * @param {Object} CryptoJS https://code.google.com/p/crypto-js/
 * @param {Object} appConstants current applications constants
 */
angular.module('<%= name %>')
.service('cryptoService', [ 'CryptoJS', 'appConstants', function (CryptoJS, appConstants) {
  // default statement
  return {
    /**
     * Default encrypt function
     *
     * @param {Mixed} data to encrypt
     * @param {String} encrypt key
     */
    encrypt : function (value) {
      // default statement
      return CryptoJS.AES.encrypt(JSON.stringify(value),
        appConstants.keys().keys.shared).toString();
    },
    /**
     * Default decrypt function
     *
     * @param {String} data to decrypt
     * @param {Mixed} decrypted data
     */
    decrypt : function (value) {
      // default statement
      var bytes = CryptoJS.AES.decrypt(value, appConstants.keys().keys.shared);
      // return decrypted from btyes
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
  };
}]);

/**
 * Default utility service to manage toastr usage
 *
 * @param {Object} toastr https://github.com/Foxandxss/angular-toastr
 */
angular.module('<%= name %>')
.service('toastService', [ 'toastr', function (toastr) {
  /**
   * Default toast utility function to manage toast process
   *
   * @param {String} type default type to send on toast for dynamic calling
   * @param {Object} options options to send to the object for override
   */
  var process = function (type, options) {
    // force type
    options[type] = true;
    // default call of toast
    toastr[type](true, true, { extraData : options });
  };

  // default statement
  return {
    /**
     * Default call function to process correct call
     *
     * @param {Object} params default params to use on toast 
     */
    toastCall : function (params) {
      // default type
      var type =  params.success ? 'success' :
                  params.warning ? 'warning' : 
                  params.info    ? 'info' : 'error';
      // call correct request
      this[type].call(this, params);
    },
    /**
     * Default success wrapper function
     *
     * @param {Object} options default options to use on toast 
     */
    success : function (options) {
      // default process
      process('success', options);
    },
    /**
     * Default error wrapper function
     *
     * @param {Object} options default options to use on toast 
     */
    error : function (options) {
      // default process
      process('error', options);
    },
    /**
     * Default info wrapper function
     *
     * @param {Object} options default options to use on toast 
     */
    info : function (options) {
      // default process
      process('info', options);
    },
    /**
     * Default warning wrapper function
     *
     * @param {Object} options default options to use on toast 
     */
    warning : function (options) {
      // default process
      process('warning', options);
    }
  };
}]);

/**
 * Mock utility service
 *
 * @param {Object} $httpBackend https://docs.angularjs.org/api/ngMock/service/$httpBackend
 * @param {Object} $http https://docs.angularjs.org/api/ng/service/$http
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} $rootScope https://docs.angularjs.org/api/ng/service/$rootScope
 */
angular.module('<%= name %>')
.service('mockService', [ '$httpBackend', '$http', '_', '$rootScope',
function ($httpBackend, $http, _, $rootScope) {
  // default statement
  return {
    /**
     * Default method to mocks another services
     *
     * @param {Boolean} activeMock true if the mock service is active
     */
    build : function (activeMock) {
      // mock is active ?
      if (activeMock) {
        $http.get('assets/mocks/mocks.json').then(function successCallback (success) {
          // check if the success.data has expectRoutes
          if (_.has(success.data, 'expectRoutes')) {
            // Parse the success.data.expectRoutes to build expect $httpBackend routes
            _.forEach(success.data.expectRoutes, function (obj) {
              // Check if the obj.regex is true if it's regexp the obj.url
              var url = obj.regex ? RegExp(obj.url) :  obj.url;
              // passTrought the url
              $httpBackend.when(obj.type, url).passThrough();
            });
          }
          // check if the success.data has routes
          if (_.has(success.data, 'routes')) {
            // count the number of route to build
            var numberRoutes = _.size(success.data.routes);
            // Init var initNumberRoutes
            var initNumberRoutes = 0;
            // Parse success.data.routes to build fake $http routes
            _.forEach(success.data.routes, function (obj) {

              // Add +1 at initNumberRoutes
              initNumberRoutes++;
              // Check if the numberRoutes is equal to initNumberRoutes
              if (numberRoutes === initNumberRoutes) {
                // Broadcast the event $routes.build.success
                $rootScope.$broadcast('$routes.build.success');
              }

              // Check if the obj.regex is true if it's regexp the obj.url
              var url = obj.regex ? RegExp(obj.url) :  obj.url;
              // Check if the obj.params exist if it's not put empty arconray
              var objParams = obj.params ? obj.params : [];

              // Build fake route
              $httpBackend.when(obj.type, url, undefined, undefined, objParams).respond(
                function (method, url, data, headers, params) {
                  // Init the data to send
                  var dataSend;
                  // Check if the params is not empty
                  if (!_.isEmpty(objParams)) {
                    // parse all items
                    _.forEach(params, function (obj, key) {
                      // is empty ? for delete action
                      if (_.isEmpty(obj)) {
                        delete(params[key]);
                      }
                    });
                    // Build the data to send
                    dataSend = _.get(_.find(_.get(success.data, obj.response), params), 'return');
                  } else {
                    // Build the data to send
                    dataSend = _.get(success.data, obj.response);
                  }
                  return [
                    200, {
                      status  : 'success',
                      code    : '200000',
                      message : [ 'httpBackend', obj.url ].join(' '),
                      data    : dataSend
                    },
                    {}
                  ];
                }
              );
            });
          }
        }, function errorCallback(error) {
          // DO stuff here ... nothing to do for the moment
        });
      } else {
        // Allow all routes with type GET
        $httpBackend.whenGET(/(.+)/).passThrough();
        // Allow all routes with type POST
        $httpBackend.whenPOST(/(.+)/).passThrough();
        // Allow all routes with type PATCH
        $httpBackend.whenPATCH(/(.+)/).passThrough();
        // Allow all routes with type DELETE
        $httpBackend.whenDELETE(/(.+)/).passThrough();
        // Allow all routes with type PUT
        $httpBackend.whenPUT(/(.+)/).passThrough();
        // Broadcast the event $routes.build.success
        $rootScope.$broadcast('$routes.build.success');
      }
    },
    /**
     * Default method to build default exception routes
     */
    buildDefaultRoutes : function () {
      $httpBackend.whenGET('notFound').passThrough();
      $httpBackend.whenGET('token/refresh').passThrough();
      $httpBackend.whenGET(/(.+)\/token\/refresh\//).passThrough();
      $httpBackend.whenGET('assets/mocks/mocks.json').passThrough();
      $httpBackend.whenGET('/config').passThrough();
      $httpBackend.whenPOST('/log/message').passThrough();
      $httpBackend.whenGET(/^\/partials\//).passThrough();
      $httpBackend.whenGET(/^\partials\//).passThrough();
      $httpBackend.whenGET(/^\/config\//).passThrough();
    }
  };
}]);