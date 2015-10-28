'use strict';

var generators  = require('yeoman-generator');
var mkdirp      = require('mkdirp');
var _           = require('lodash');
var n           = require('n-api');
var request     = require('request');
var chalk       = require('chalk');
var logger      = require('yocto-logger');

/**
 * Default export
 */
module.exports = generators.Base.extend({
  /**
   * Default constructor
   */
  constructor   :  function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    /**
     * Default internal config
     *
     * @property {Object}
     */
    this.cfg = {
      angular     : {
        url         : 'https://code.angularjs.org/',
        resolution  : 'latest',
        versions    : [ 'latest' ]
      },
      name        : 'Yocto Stack generator',
      nVersions   : n.ls(),
      debug       : true,
      paths       : {
        dependencies  : './config/dependencies.json',
        folders       : './config/folders.json'
      },
      generate    : {
        node    : false,
        angular : false 
      }
    };

    /**
     * Default ascii method to display content to ascii
     *
     * @param {String} name ascii name to get
     * @param {Boolean} exit if true en current program
     */
    this.asciiMessage = function (name, exit) {
      // normalize exit process
      exit = _.isBoolean(exit) ? exit : false;
      // TODO here

      // exit ?
      if (exit) {
        process.exit(0);
      }
    };
    /**
     * Utility method to normalize given
     *
     * @param {String} path current path to use
     * @return {String} generated path
     */
    this.normalizePath = function (path) {
      // default statement
      return path.normalize([ process.cwd(), path ].join('/'));
    };

    /**
     * Utility method to prefix path for debug mode
     *
     * @param {String} path current path to use
     * @return {String} generated path
     */
    this.prefixPath = function (path) {
      // is debug ?
      if (this.cfg.debug) {
        // normalize process
        return this.normalizePath([ 'example', path ].join('/'));
      }
      // default statement
      return path;
    };

    /**
     * Default utility method to display a banner message
     *
     * @param {String} message message to display
     */
    this.banner = function (message) {
      // process banner
      logger.banner([ '[', this.cfg.name, '] -', message ].join(' '));
    };
    /**
     * Default utility method to log message on generator
     *
     * @param {String} color default color to use for logging
     * @param {String} message message to display
     */
    this.logger =  function (color, message) {
      // normalize color
      color = _.isString(color) && !_.isEmpty(color) ? color : 'green';
      // default process
      this.log([ chalk[color]('>>'), message ].join(' '));
    };
    /**
     * Default utility method for error message
     *
     * @param {String} message message to display
     */
    this.error  = function (message) {
      // default proess
      this.logger('red', message);
    };

    /**
     * Default utility method for warning message
     *
     * @param {String} message message to display
     */
    this.warning  = function (message) {
      // default proess
      this.logger('yellow', message);
    };

    /**
     * Default utility method for warning message
     *
     * @param {String} message message to display
     */
    this.info  = function (message) {
      // default proess
      this.logger('green', message);
    };
  },
  /**
   * Initializing part
   */
  initializing : {
    /**
     * Default banner
     */
    welcome       : function () {
      // process welcome message
      this.asciiMessage('welcome');
    },
    /**
     * Default Ready function
     */
    ready         : function () {
      // create an async process
      var done = this.async();

      // prompt message
      this.prompt([ {
        name    : 'ready',
        message : 'This process will take ~5 minutes. Are your ready ?',
        type    : 'confirm'
      }], function (props) {
        if (props.ready) {
          done();
        } else {
          // process coffee message
          this.asciiMessage('wait-coffee', true);
        }

      }.bind(this));
    },

    /**
     * Retreive here dependencies / folders and angular versions
     */
    init          : function () {
      // default banner
      this.banner('We are initializing some data. Take a cofee and wait a few moment.');
      // create async process
      var done    = this.async();
      // save context
      var context = this;
      // require dependencies
      this.dependencies = require(this.cfg.paths.dependencies);
      // message
      this.info('Retreive dependencies config succeed.');
      // require folders
      this.folders      = require(this.cfg.paths.folders);
      // message
      this.info('Retreive folders structures succeed.');
      // message
      this.warning([ 'Try to connect on', this.cfg.angular.url,
                     'to retreive angular available versions' ].join(' '));
      // process request
      request(this.cfg.angular.url, function (error, response, body) {
        // has error
        if (!error && response.statusCode === 200) {
          // default resolution
          var m;
          // default rules
          var re = /href="([0-9]\.[0-9]\.[0-9])\/\"/gm; 

          // parse all
          while ((m = re.exec(body)) !== null) {
            context.cfg.angular.versions.push(m[1]);
          }
          // reverse array
          context.cfg.angular.versions      = _(context.cfg.angular.versions).reverse().value();
          // and set default resolution
          context.cfg.angular.resolution    = _.first(context.cfg.angular.versions);
          // message
          context.info('Retreive angular version succeed.');
          // end process
          done();
        }
      });
    },
    /**
     * Choose which type of app we need
     */
    chooseAppType : function () {
      // default banner
      this.banner('Now it time to tell us which type of application you want');
      // create an async process
      var done = this.async();

      // define app choises
      var appChoices = [ 'A NodeJs application', 'An AngularJs application',
                         'A NodeJs application with AngularJs' ];
      // prompt message
      this.prompt([ {
        name    : 'typeApp',
        message : 'What type of application you want to generate ?',
        type    : 'list',
        choices : appChoices
      }], function (props) {
        // generate node app state
        this.cfg.generate.node    = (props.typeApp === _.first(appChoices) ||
                                     props.typeApp === _.last(appChoices));
        // generate node app state
        this.cfg.generate.angular = (props.typeApp === appChoices[1] ||
                                     props.typeApp === _.last(appChoices));
        // end process
        done();
      }.bind(this));
    }
  },
  /**
   * Do more complex user interact
   */
  prompting : {
    /**
     * Process node package configuration choices
     */
    nodePackage : function () {
      // create an async process
      var done = this.async();
      // define prompts here
      var prompts = [ {
        name        : 'name',
        message     : 'What is your application name ?',
        validate    : function (input) {
          // default statement
          return !_.isEmpty(input) ? true : 'Please enter a valid application name.'
        }
      },
      {
        name        : 'description',
        message     : 'What is your application desription ?',
        validate    : function (input) {
          // default statement
          return !_.isEmpty(input) && input.length > 10 ? true :
                 'Please enter a valid description with at least 10 chars';
        }
      },
      {
        name        : 'version',
        message     : 'What is your application version (format x.x.x) ?',
        default     : '0.1.0',
        validate    : function (input) {
          // default rules
          var reg = /^(\d+)\.(\d+)\.(\d+)$/;
          // default statement
          return !_.isNull(reg.exec(input));
        }
      },
      {
        name        : 'private',
        type        : 'confirm',
        message     : 'Your application is private ?'
      } ];

      // process prompting
      this.prompt(prompts, function (props) {
        this.node = _.extend({}, props);
        console.log(this.node);

        // end process
        done();
      }.bind(this));
    }
  }
});