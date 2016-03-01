'use strict';

var path  = require('path');
var fs    = require('fs');
var glob  = require('glob');

/**
 * Retreive default config data for your app
 *
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 */
exports.base = function (req, res) {
  // default config object
  var config = {};

  // normalize it
  var allConfigNeeded = req.params.all || false;

  // get app config
  var env = this.get('config').config.env || 'development';
  // get current protocol
  var protocol =  this.get('protocol');

  // get all json file
  glob('*.json', {
    cwd       : path.normalize([ process.cwd(), 'app/config' ].join('/')),
    realpath  : true
  }, function (err, files) {
    // has error ?
    if (_.isNull(err)) {
      // load each files
      async.eachSeries(files, function (file, next) {
        // try process for parse error
        try {
          // merge data
          _.merge(config, JSON.parse(fs.readFileSync(file)));
        } catch (e) {
          // log error
          this.get('logger').error([ '[ Config:endpoint:base ] -',
                                     'An error occured during font configuration loading :',
                                     e.message
                                   ].join(' '));
          // send internal server error
          res.sendStatus(500);
        }
        // to next item
        next();
      }.bind(this), function () {
        // env config
        var replace = path.normalize([ process.cwd(),
                                  [ 'app/config/env', [ env, 'json' ].join('.') ].join('/')
                                 ].join('/'));

        // try process for parse error
        try {
          // merge with env config
          _.merge(config, JSON.parse(fs.readFileSync(replace)));
        } catch (e) {
          // log error
          this.get('logger').error([ '[ Config:endpoint:base ] -',
                                     'An error occured during font configuration loading :',
                                     e.message
                                   ].join(' '));
          // send internal server error
          res.sendStatus(500);
        }
        // default valid response
        res.jsonp(config);
      }.bind(this));
    } else {
      // log error
      this.get('logger').error([ '[ Config:endpoint:base ] -',
                                 'Cannot get config file :',
                                  err
                               ].join(' '));
      // send internal server error
      res.sendStatus(500);
    }
  }.bind(this));
};

/**
 * Retreive default config data for your app
 */
exports.languages = function (req, res) {
  // default config object
  var languages = {};

  // try process
  try {
    // normalize path before reading
    var lang = path.normalize([ process.cwd(), 'app/config/languages',
                                            [ req.params.isoCode, 'json' ].join('.') ].join('/'));
    // assign languages
    languages = JSON.parse(fs.readFileSync(lang));
  } catch (e) {
    // log error
    this.get('logger').error([ '[ Config:endpoint:languages ] -',
                               'An error occured during language loading for [',
                               req.params.isoCode , '] :', e.message ].join(' '));
  }

  // default response
  res.jsonp(languages);
};