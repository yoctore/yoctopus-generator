'use strict';

/**
 * Add lodash on app
 */
angular.module('<%= name %>').constant('_', window._);
/**
 * Add momentjs on app
 */
angular.module('<%= name %>').constant('moment', moment);
/**
 * Add async on app
 */
angular.module('<%= name %>').constant('async', async);