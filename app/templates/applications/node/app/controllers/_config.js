'use strict';

var path  = require('path');
var fs    = require('fs');

/**
 * Retreive default config data for your app
 */
exports.base = function (req, res) {
  // default config object
  var config = {};

  // try process
  try {
    // normalize path before reading
    var file = path.normalize([ process.cwd(), 'app/config/front.json' ].join('/'));
    // assign config
    config = JSON.parse(fs.readFileSync(file));
  } catch (e) {
    // log error
    this.get('logger').error([ '[ Config:endpoint:base ] -',
                               'An error occured during font configuration loading :',
                                e.message
                             ].join(' '));
  }

  // default response
  res.jsonp(config);
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