'use strict';

/**
 * Trust HTML Filter
 */
angular.module('<%= name %>')
.filter('htmlsafe', [ '$sce', function ($sce) {
  // default statement
  return function (value) {
    // trust as html
    return $sce.trustAsHtml(value);
  };
}]);

/**
 * Special filter for string. Transport string to ucfirst
 */
angular.module('<%= name %>')
.filter('ucfirst', [ '_', function (_) {
  // default statement
  return function (value) {
    // return value
    return _.capitalize(value)
  };
}]);

/**
 * Custom filter to return a specific string on date format
 *
 * @example : {{ data | ecrmdate }}
 * @example : {{ data | ecrmdate:'YYYY/DD/MM' }}
 */
angular.module('<%= name %>')
.filter('dateFormat', [ '_', 'moment', function (_, moment) {
  // default statement
  return function (value, format) {
    // If val is empty, no return
    if (!_.isEmpty(value)) {
      // default format
      var dateFormat = format || "DD/MM/YYYY";

      // return specific date
      return moment(value).format(dateFormat);
    }
  };
}]);