'use strict';

var generators  = require('yeoman-generator');
var mkdirp      = require('mkdirp');
var _           = require('lodash');
var n           = require('n-api');
var request     = require('request');
var chalk       = require('chalk');
var logger      = require('yocto-logger');
var spdx        = require('spdx');
var isEmail     = require('isemail');
var isUrl       = require('is-url');
var path        = require('path');
var uuid        = require('uuid');
var async       = require('async');

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

      // normalize path
      var p = this.normalizePath([ [ './app/ascii', name ].join('/'), 'txt' ].join('.'));

      // file exists 
      if (this.fs.exists(p)) {
        // log message
        this.log(this.fs.read(p));
      }
      // exit ?
      if (exit) {
        process.exit(0);
      }
    };

    /**
     * Utility method to normalize given
     *
     * @param {String} p current path to use
     * @return {String} generated path
     */
    this.normalizePath = function (p) {
      // default statement
      return path.normalize([ process.cwd(), p ].join('/'));
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
        return this.normalizePath([ '/debug', path ].join('/'));
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
  initializing  : {
    /**
     * Default banner
     */
    welcome       : function () {
      // process welcome message
      this.asciiMessage('welcome-coffee');
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
      },
      {
        name    : 'debug',
        type    : 'confirm',
        message : [ 'Do you want run this process in debug mode ?',
                   '(we will create and use debug directory for',
                    'data generation process)' ].join(' ')
      }], function (props) {
        // ready ?
        if (props.ready) {
          // enable debug mode
          this.cfg.debug = props.debug;
          // log ascii debug
          this.asciiMessage('debug-mode');
          // end process
          done();
        } else {
          // process coffee message
          this.asciiMessage('goodbye', true);
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
      this.banner('Now it\'s time to tell us which type of application you want');
      // create an async process
      var done = this.async();

      // define app choises
      var appChoices = [ 'An application only based on NodeJs',
                         'An application only based on AngularJs',
                         'An application based on NodeJs & AngularJs' ];
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
        this.cfg.generate.angular = (props.typeApp === _.last(appChoices) || 
                                     props.typeApp === appChoices[1]);
        // end process
        done();
      }.bind(this));
    }
  },
  /**
   * Do more complex user interact
   */
  prompting     : {
    /**
     * Process node package configuration choices
     */
    nodeBasePackage   : function () {
      // process node package ?
      if (this.cfg.generate.node) {
        // banner message
        this.banner('Now tell us some informations about your NodeJs configuration.');
        // create an async process
        var done = this.async();

        /**
         * Default base object to prefill if we are in debug mode
         */
        var baseObj = [ {
          name        : 'name',
          message     : 'What is your application name ?',
          validate    : function (input) {
            // default statement
            return !_.isEmpty(input) ? true : 'Please enter a valid application name.'
          }
        },
        {
          name        : 'description',
          message     : 'What is your application description ?',
          validate    : function (input) {
            // default statement
            return !_.isEmpty(input) && input.length > 10 ? true :
                   'Please enter a valid description with at least 10 chars';
          }
        } ];

        // is debug ?
        if (this.cfg.debug) {
          _.each(baseObj, function (value) {
            // add a random value for debug mode
            _.extend(value, { default : uuid.v4() });
          }, this);
        }

        // define prompts here
        var prompts = _.flatten([ baseObj,
        {
          name        : 'version',
          message     : 'What is your application version (x.x.x) ?',
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
        },
        {
          name        : 'license',
          type        : 'list',
          default     : 'Apache-2.0',
          message     : 'Which licence for your application ?',
          choices     : spdx.licenses
        },
        {
          name        : 'authorName',
          message     : 'What is the author for this app ?',
          default     : this.user.git.name()
        },
        {
          name        : 'authorEmail',
          message     : 'What is the author email for this app ?',
          default     : this.user.git.email(),
          validate    : function (input) {
            // default statement
            return isEmail(input) ? true : 'Please enter a valid email';
          }
        },
        {
          name        : 'authorUrl',
          message     : 'What is the author url for this app ?',
          validate    : function (input) {
            // default statement
            return _.isEmpty(input) ? true : (isUrl(input) ? true : 'Please enter a valid url');
          }
        },
        {
          name        : 'engines',
          type        : 'list',
          message     : 'Which version of node your application must depend ?',
          choices     : _(this.cfg.nVersions).reverse().value(),
          default     : _.first(this.cfg.nVersions)
        } ]);
  
        // process prompting
        this.prompt(prompts, function (props) {
          // format engines process
          props.engines = { node : [ '>=', props.engines ].join('') }
          
          // normalize author
          _.extend(props, { 
            author : { 
              name  : props.authorName,
              email : props.authorEmail,
              url   : props.authorUrl
            }
          });
  
          // delete non needed data
          delete props.authorName;
          delete props.authorEmail;
          delete props.authorUrl;
  
          // extend object
          this.node = _.extend({}, props);
  
          // end process
          done();
        }.bind(this));
      }
    },
    /**
     * Process bower package configuration choices
     */
    bowerBasePackage  : function () {
      // process node package ?
      if (this.cfg.generate.angular) {
        // banner message
        this.banner('Now tell us some informations about your AngularJS configuration.');
        // create an async process
        var done    = this.async();
        // define prompts here
        var prompts = [];

        // default obj to use if nodeja app is not defined
        var defaultObj = [ {
          name        : 'name',
          message     : 'What is your application name ?',
          validate    : function (input) {
            // default statement
            return !_.isEmpty(input) ? true : 'Please enter a valid application name.'
          }
        },
        {
          name        : 'description',
          message     : 'What is your application description ?',
          validate    : function (input) {
            // default statement
            return !_.isEmpty(input) && input.length > 10 ? true :
                   'Please enter a valid description with at least 10 chars';
          }
        },
        {
          name        : 'version',
          message     : 'What is your application version (x.x.x) ?',
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
        },
        {
          name        : 'license',
          type        : 'list',
          default     : 'Apache-2.0',
          message     : 'Which licence for your application ?',
          choices     : spdx.licenses
        },
        {
          name        : 'authorName',
          message     : 'What is the author for this app ?',
          default     : this.user.git.name()
        },
        {
          name        : 'authorEmail',
          message     : 'What is the author email for this app ?',
          default     : this.user.git.email(),
          validate    : function (input) {
            // default statement
            return isEmail(input) ? true : 'Please enter a valid email';
          }
        },
        {
          name        : 'authorUrl',
          message     : 'What is the author url for this app ?',
          validate    : function (input) {
            // default statement
            return _.isEmpty(input) ? true : (isUrl(input) ? true : 'Please enter a valid url');
          }
        } ];

        // si node app is not defined add default prompt data
        if (!this.cfg.generate.node) {
          // parse all item
          _.each(defaultObj, function (obj) {
            // add item
            prompts.push(obj);
          })
        }

        if (!_.isEmpty(prompts)) {
          // process prompting
          this.prompt(prompts, function (props) {
  
            // normalize author
            _.extend(props, { 
              author : { 
                name  : props.authorName,
                email : props.authorEmail,
                url   : props.authorUrl
              }
            });
  
            // delete non needed data
            delete props.authorName;
            delete props.authorEmail;
            delete props.authorUrl;
  
            // extend object
            this.angular = _.extend({}, props);

            // end process
            done();
          }.bind(this));
        } else {
          // assign data
          this.angular = _.clone(this.node);
          // remove non needed data
          delete this.angular.engines;
          // message
          this.info('We are using your nodejs configuration for your angular configuration.');
          // end process
          done();
        } 
      }
    },
    /**
     * Process choice for structure generation
     */
    generateFolders   : function () {
      // create async process
      var done    = this.async();
      // banner message
      this.banner('So maybe you want to generate a file structure for your app');

      this.prompt([ {
        name    : 'structure',
        type    : 'confirm',
        default : true,
        message : [ 'Do confirm that you want generate',
                    'project structure based on your app type choice ?' ].join(' ')
      }], function (props) {
        // extend config
        _.extend(this.cfg, {
          structure : {
            enable : props.structure
          }
        });
        // end process
        done();
      }.bind(this));
    },
    /**
     * Process choice for structure generation
     */
    forceRemoveExistingFolders   : function () {
      // create async process
      var done    = this.async();
      // banner message
      this.banner([ 'We need to know if you allow us',
                    'to remove existing project stucture is exists' ].join(' '));

      // list of prompts
      this.prompt([ {
        name    : 'erase',
        type    : 'confirm',
        default : false,
        message : [ 'Do confirm that you allow us to remove existing',
                    'directory structure if exists ?' ].join(' ') ].join(' ')
      },
      {
        name    : 'eraseConfirm',
        type    : 'confirm',
        default : false,
        message : chalk.red([ 'Do you confirm your previous action ? (This must run a',
                              'rm -r of existing directory)' ].join(' ')
      }], function (props) {
        // extend config
        _.extend(this.cfg, { erase : props.erase === props.eraseConfirm });
        // end process
        done();
      }.bind(this));
    }
  },
  /**
   * configuring process
   */
  configuring   : {
    /**
     * Generate folders if is set to true
     */
    generateFolders             : function () {
      // default file struture
      var structure = [];
      // build structure ?
      if (this.cfg.structure.enable) {
        // is node ?
        if (this.cfg.generate.node) {
          structure.push(this.folders.node);
        }
        // angular structure ?
        if (this.cfg.generate.angular) {
          structure.push(this.folders.angular);
        }
        // extra structure ??
        structure.push(this.folders.extra);
        // fatten data to have one level depth of data
        structure = _.flatten(structure);
        // map each structure
        structure = _.map(structure, function (s) {
          // default statement
          return this.prefixPath(s);
        }, this);

        // extend structure
        _.extend(this.cfg.structure, { directory : structure } );
      }
    },
    /**
     * Generate config for you app
     */
    generateExtraDependencies   : function () {
      // create async process
      var done = this.async();

      // to execute
      async.eachSeries([ 'dependencies', 'devDependencies' ], function (type, next) {
        // prompt list
        var prompt = [];

        // generate node ?
        if (this.cfg.generate.node && !_.isEmpty(this.dependencies.extra.node[type])) {
          // add in prompt dependencies
          prompt.push({
            name    : 'nDependencies',
            type    : 'checkbox',
            message : [ 'Choose extra', type, 'for your NodeJs application :' ].join(' '),
            choices : this.dependencies.extra.node[type]
          });
        }
        // generate angular ?
        if (this.cfg.generate.angular && !_.isEmpty(this.dependencies.extra.angular[type])) {
          // add in prompt dependencies
          prompt.push({
            name    : 'aDependencies',
            type    : 'checkbox',
            message : [ 'Choose extra', type, 'for your AngularJs application :' ].join(' '),
            choices : this.dependencies.extra.angular[type]
          });
        }
        // Is empty ?
        if (!_.isEmpty(prompt)) {
          // banner message
          this.banner([ 'Maybe you want install extra', type ].join(' '));
          // prompt elements
          this.prompt(prompt, function (props) {
            // node ?
            if (this.cfg.generate.node) {
              // change dependencies for ndoe
              this.dependencies.node[type] = _.flatten([ this.dependencies.node[type],
                                                         props.nDependencies ]);
            }

            // angular ?
            if (this.cfg.generate.angular) {
              // change dependencies for angular
              this.dependencies.angular[type] = _.flatten([ this.dependencies.angular[type],
                                                            props.nDependencies ]);
            }
            // next process
            next();
          }.bind(this));
        } else {
          // next process
          next();
        }
      }.bind(this), function () {
        // end process
        done();
      });
    }
  },
  /**
   * writing process
   */
  writing   : {
  
  }
});