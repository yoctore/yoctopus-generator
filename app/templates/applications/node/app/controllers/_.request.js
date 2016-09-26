'use strict';

var request   = require('request');
var _         = require('lodash');
var requestIp = require('request-ip');

/**
 * Utility method to process token refresh on server
 *
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 */
exports.api = function (req, res) {
  // Retrieve api information
  var api      = this.get('config').config.api;
  // Retrieve app information
  var app      = this.get('config').config.app;
  // Retrieve the host
  var host     = this.get('config').config.host;
  // Retrieve the client Ip
  var clientIp = requestIp.getClientIp(req);
  // Retrieve method check if is undefined
  var method   = _.isUndefined(req.body.method) ? {} : req.body.method.toLowerCase();
  // send request to the
  // defined default config object
  var config = {
    uri             : [ api.url, req.body.url ].join(''),
    method          : method
  };

  // remove non needed data
  _.extend(config, {
    // check if data exist and not null, if not exist sign an empty object
    body    : [ this.get('jwt').sign((_.isUndefined(req.body.data) || _.isNull(req.body.data) ||
    req.body.data === 'null') ? {} : req.body.data) ],
    json    : true,
    headers : {
      'x-jwt-access-token' : this.get('jwtToken'),
      'x-origin-app'       : _.isUndefined(app.name) ? '' : app.name,
      'x-origin-ip'        : _.isEmpty(clientIp) || _.isUndefined(clientIp) ? '' : clientIp,
      'x-origin-host'      : _.isUndefined(host) ? '' : host,
    }
  });

  // has xorigin id ?
  if (_.has(req.headers, 'x-origin-id')) {
    _.merge(config, { headers : { 'x-origin-id' : req.headers['x-origin-id'] } });
  }
  // process request on api
  request(config, function (error, response, body) {
    // has error ?
    if (!error && response.statusCode === 200) {
      // get current data
      var data = this.get('jwt').decode(_.first(!_.isArray(body) ? JSON.parse(body) : body));
      // default response
      res.jsonp(data);
    } else {
      // send status code
      res.status(_.isUndefined(response) ? 502 : response.statusCode).end();
    }
  }.bind(this));
};
