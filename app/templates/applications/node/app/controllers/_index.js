'use strict';

var sitemap = require('sitemap');
var utils   = require('yocto-utils');
var _       = require('lodash');
var path    = require('path');
var fs      = require('fs-extra');

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

/**
 * Default index render
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 * @param {Object} next next item to process
 */
exports.index = function(req, res, next) {
  // log all request on debug mode
  this.get('logger').debug([ '[ Router ] - Receiving a', req.method,
                             'request for', req.originalUrl
                           ].join(' '));
  // render your index
  this.get('render').render(res, 'index', {});
};

/**
 * Get robots or sitemap content
 * @param {Object} req current http request object
 * @param {Object} res current http response object
 */
exports.robots = function(req, res) {
  // default data
  var data = {};

  // try process
  try {
    // is site map ?? or antoher xml file
    if (_.endsWith(req.path, '.xml')) {

      // Set header
      res.header('Content-Type', 'application/xml');

      // create site map
      var sm = sitemap.createSitemap({
        hostname  : utils.request.getHost(req),
        cacheTime : 600000
      });

      /*******************************
       * ADD YOUR SITEMAP ITEMS HERE
       ******************************/

      // process data to string
      data = sm.toString();

      // Check data contents
      if (_.isNull(data) || _.isEmpty(data)) {
        this.get('logger').warning([ 'Cannot save data for file [', req.path,
                                     '] Destination file is invalid or data is empty' ].join(' '));
        // add default url
        sm.add({ url : '/'});
        // process data to string
        data = sm.toString();
      }

    } else {
      // try to get file
      var file  = path.normalize([ process.cwd(), req.path ].join('/'));
      // load data
      data      = fs.readFileSync(file, 'utf-8');
    }
  } catch (e) {
    // data to empty
    data = {};

    // log message
    this.get('logger').warning([ 'Cannot retrieve data for [', req.path,
                                 ']. Exception is', e.message ].join(' '));
  }

  // is site map ?? or antoher xml file
  if (_.endsWith(req.path, '.txt')) {
    // change header
    res.header('Content-Type', 'text/plain');
  }

  // is site map ?? or antoher xml file
  if (_.endsWith(req.path, '.html')) {
    // change header
    res.header('Content-Type', 'text/html');
  }

  // render
  res.send(data).end();
};

/**
 * Default sitemap process
 */
exports.sitemap = exports.robots;

/**
 * Default partials process
 */
exports.partials = function(req, res) {
  // normalize file
  var file = req.originalUrl.replace('/partials', 'partials');
 // render file
  this.get('render').render(res, file, {});
};