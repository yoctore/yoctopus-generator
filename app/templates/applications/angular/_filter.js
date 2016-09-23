'use strict';

/**
 * Trust HTML Filter
 *
 * @param {Object} $sce https://docs.angularjs.org/api/ng/service/$sce
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
 *
 * @param {Object} _ lodash object https://lodash.com/docs
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
 * @example : {{ data | dateFormat }}
 * @example : {{ data | dateFormat:'YYYY/DD/MM' }}
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} moment http://momentjs.com/docs/
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

/**
 * Replace bad value in ICU url
 *
 * @example : {{ data | trimBadUrl:'filter':'replacement' }}
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('trimBadUrl', [ '_', function (_) {
  // default statement
  return function (value, filter, replacement) {
    // data is valid before process ?
    if (!_.isEmpty(value) && !_.isEmpty(filter)) {
      // replace
      return value.replace(filter, replacement || '');
    }

    // default statement
    return value;
  };
}]);

/**
 * Special filter to remove extra prefix code on iso code. to retreive main country code
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('isoFlags', [ '_', function (_) {
  // default statement
  return function (value) {
    // return value
    return value.substring((value.length - 2), value.length);
  };
}]);

/**
 * Special filter add Cdn Url from given path
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 * @param {Object} appConstants current applications constants
 */
angular.module('<%= name %>')
.filter('CdnUrl', [ '_', 'appConstants', function (_, appConstants) {
  // default statement
  return function (path) {
    // default assets
    var assets = appConstants.assets || {};
    // return value
    return [ assets.CdnUrl || '', path ].join('/');
  };
}]);

/**
 * Special filter to build a correct alt name for a picture
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('altImg', [ '_', function (_) {
  // default statement
  return function (path) {
    // process image replacement
    return _.snakeCase(path).replace(/_/g, '-');
  };
}]);

/**
 * Special filter to truncate a string
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('truncate', [ '_', function (_) {
  // default statement
  return function (value, length) {
    // normalize lentgh
    length = !_.isNumber(length) ? value.length : length;
    // process truncate
    return _.trunc(value, length);
  };
}]);

/**
 * Special filter to check is value is a number
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('isNumber', [ '_', function (_) {
  // default statement
  return function (value) {
    // default statement
    return _.isNumber(value);
  };
}]);

/**
 * Special filter to check is value is a number
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('isStringStrict', [ '_', function (_) {
  // default statement
  return function (value) {
    // default statement
    return _.isString(value) && !_.isNumber(value);
  };
}]);

/**
 * Special filter to check is value is a number
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('isArray', [ '_', function (_) {
  // default statement
  return function (value) {
    // default statement
    return _.isArray(value);
  };
}]);

/**
 * Special filter to check is value is an Object
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('isObject', [ '_', function (_) {
  // default statement
  return function (value) {
    // default statement
    return _.isObject(value);
  };
}]);

/**
 * Special filter to check is value is empty or not
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('isEmpty', [ '_', function (_) {
  // default statement
  return function (value) {
    // default statement
    return _.isEmpty(value);
  };
}]);

/**
 * Special filter to fixed number of decimal
 *
 * @param {Object} _ lodash object https://lodash.com/docs
 */
angular.module('<%= name %>')
.filter('toFixed', [ '_', function (_) {
  // default statement
  return function (value, number) {
  // default statement
    return _.isUndefined(value) ? 0 : Number(value).toFixed(number);
  };
}]);