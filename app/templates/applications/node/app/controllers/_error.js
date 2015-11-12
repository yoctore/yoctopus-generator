'use strict';

/**
 * Default notFound process
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 * @param {Object} next next item to process
 */
exports.notFound = function(req, res, next) {
  // send status
  res.sendStatus(404);
};

/**
 * Default systemError process
 * @param {Object} err current system errro
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 * @param {Object} next next item to process
 */
exports.systemError = function(err, req, res, next) {
  // get current logger and log stack
  this.get('logger').error([ '[ Router ] - A system error occured', err.stack ].join(' '));
  // send status
  res.sendStatus(500);
};