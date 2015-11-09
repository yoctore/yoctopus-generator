'use strict';

/**
 * Logger service
 */
angular.module('<%= name %>')
.service('logService', [ '$log', 'appConstants', '$http', '_',
function ($log, appConstants, $http, _) {
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
          message  : message,
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
      // default log process
      $log.log(message);
    },
    /**
     * Write an information message
     */
    info : function (message) {
      // default log process
      $log.info(message);
    },
    /**
     * Write an warning message
     */
    warn : function (message) {
      // process notify
      this.notify(message, 'warning');
      // default log process
      $log.warn(message);
    },
    /**
     * Write an warning message
     */
    error : function (message) {
      // process notify
      this.notify(message, 'error');
      // default log process
      $log.error(message);
    },
    /**
     * Write an warning message
     */
    debug : function (message) {
      // default log process
      $log.debug(message);
    }
  };
}]);