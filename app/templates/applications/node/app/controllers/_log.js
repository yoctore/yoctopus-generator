'use strict';

var _ = require('lodash');

/**
 * Log message endpoint
 */
exports.messages =  function (req, res) {
  // retreive data
  var message = req.body.message;
  var type    = req.body.type || 'error';

  // is valid ?
  if (_.isString(message) && !_.isEmpty(message)) {
    this.get('logger')[type]([ '[ Log:endpoint:messsage ] -', message ].join(' '));
  }
  // response
  res.status(200).end();
};