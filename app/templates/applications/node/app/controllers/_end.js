'use strict';

/**
 * Default trace router
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 * @param {Object} next next item to process
 */
exports.trace = function(req, res, next) {
  // log all request on debug mode
  this.get('logger').debug([ '[ Router ] - Receiving a', req.method,
                             'request for', req.originalUrl
                           ].join(' '));
  // next process
  next();
};