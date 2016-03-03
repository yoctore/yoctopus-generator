'use strict';

var _       = require('lodash');

/**
 * Utility method to process token refresh on server
 *
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 */
exports.tokenRefresh = function (req, res) {
  // get jwt
  var jwt = this.get('jwt');
  // default response
  res.send(jwt ? jwt.generateAccessToken() : 'You must enable jwt').end();
};