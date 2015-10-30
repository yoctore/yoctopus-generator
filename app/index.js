'use strict';

var generators      = require('yeoman-generator');
var _               = require('lodash');
var n               = require('n-api');
var request         = require('request');
var chalk           = require('chalk');
var logger          = require('yocto-logger');
var spdx            = require('spdx');
var isEmail         = require('isemail');
var isUrl           = require('is-url');
var path            = require('path');
var uuid            = require('uuid');
var async           = require('async');
var fs              = require('fs-extra');
var Spinner         = require('cli-spinner').Spinner;
var time            = require('time');
var GruntfileEditor = require('gruntfile-editor');
var jsbeauty        = require('js-beautify')['js_beautify'];
var yosay           = require('yosay');

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
     * Current grunt file editor. we dont use yeaoman generator beacuse
     * we can't remove autoloading of Gruntfile.js
     */
    this.gruntEditor  = new GruntfileEditor();

    /**
     * Default spinner instance
     */
    this.spinner      = new Spinner('%s');

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
        folders       : './config/folders.json',
        grunt         : './config/gruntfile.json'
      },
      generate    : {
        node    : false,
        angular : false 
      },
      codes       : {
        eManual   : 500,
        dFailed   : 501,
        fFailed   : 502,
        gFailed   : 503
      },
      ascii       : {
        coffee    : 'coffee',
        debug     : 'debug-mode',
        bye       : 'goodbye',
        welcome   : 'welcome'
      }
    };

    process.on('exit', function (code) {
      console.log('TODO HERE yoctopus ascii art');
    }.bind(this));

    /**
     * Default ascii method to display content to ascii
     *
     * @param {String} name ascii name to get
     * @param {Boolean} exit if true en current program
     */
    this.asciiMessage = function (name, exit) {
      // normalize exit process
      exit = _.isBoolean(exit) ? exit : false;

      // normalize path
      var p = this.normalizePath([ [ './app/ascii', name ].join('/'), 'txt' ].join('.'));

      // file exists 
      if (this.fs.exists(p)) {
        // save current content
        var content = this.fs.read(p);

        // is debug ?
        if (name === this.cfg.ascii.debug) {
          content = chalk.blue(content);
        }

        // is coffee ?
        if (name === this.cfg.ascii.coffee) {
          content = chalk.green(content);
        }

        // log message
        this.log(content);
      }
      // exit ?
      if (exit) {
        process.exit(this.cfg.codes.eManual);
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
      // process diff
      var diff = time.time() - this.time;
      // t to process
      var t    = time.localtime(diff)
      // build time
      t        = _.compact(
                  _.flatten([
                   [ (t.minutes > 0 ? [ t.minutes, 'minutes' ].join(' ') : '') ],
                   [ (t.seconds > 0 ? [ t.seconds, 'seconds' ].join(' ') : '') ]
                  ])
                 );
      // build items
      t = !_.isEmpty(t) ? _.compact([ '(Time elapsed : ', t, ')' ]).join('') : '';

      // process banner
      logger.banner([ '[', this.cfg.name, '] -', message, t ].join(' '));
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
      this.log(yosay('Hello, and welcome to YoctopusJs generator.'));
    },
    /**
     * Default debug choices
     */
    debugMode     : function () {
      // create an async process
      var done = this.async();

      // prompt message
      this.prompt([ {
        name    : 'debug',
        type    : 'confirm',
        message : [ 'Do you want run this process in debug mode ?',
                   '(we will create and use debug directory for',
                    'data generation process)' ].join(' ')
      }], function (props) {
        // enable debug mode
        this.cfg.debug = props.debug;
        // is debug ?
        if (this.cfg.debug) {
          // log ascii debug
          this.asciiMessage(this.cfg.ascii.debug);
        }
        // end process
        done();
      }.bind(this));
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
        // ready ?
        if (props.ready) {
          // set start time
          this.time = time.time();
          // next process
          done();
        } else {
          // exit with correct code
          process.exit(this.cfg.codes.eManual);
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

      // require dependencies
      this.dependencies = require(this.cfg.paths.dependencies);
      // message
      this.info('Retreive dependencies config succeed.');
      // require folders
      this.folders      = require(this.cfg.paths.folders);
      // message
      this.info('Retreive folders structures succeed.');
      // require grunt config
      this.gruntConfig  = require(this.cfg.paths.grunt);
      // message
      this.info('Retreive grunt config succeed.');
      // message
      this.warning([ 'Try to connect on', this.cfg.angular.url,
                     'to retreive angular available versions' ].join(' '));
      // start spinner
      this.spinner.start();
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
            // add version to list
            this.cfg.angular.versions.push(m[1]);
          }
          // reverse array
          this.cfg.angular.versions      = _(this.cfg.angular.versions).reverse().value();
          // and set default resolution
          this.cfg.angular.resolution    = _.first(this.cfg.angular.versions);
          // stop spinner
          this.spinner.stop(true);
          // message
          this.info('Retreive angular version succeed.');
          // end process
          done();
        }
      }.bind(this));
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
    nodeBasePackage               : function () {
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
          props.engines = { node : props.engines };

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
    bowerBasePackage              : function () {
      // process node package ?
      if (this.cfg.generate.angular) {
        // banner message
        this.banner('Now tell us some informations about your AngularJS configuration.');
        // create an async process
        var done    = this.async();
        // define prompts here
        var prompts = [];

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

        // default obj to use if nodeja app is not defined
        var defaultObj = _.flatten([ baseObj, 
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
        } ]);

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
    generateFolders               : function () {
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
    forceRemoveExistingFolders    : function () {
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
                    'directory structure if exists ?' ].join(' ')
      },
      {
        name    : 'eraseConfirm',
        type    : 'confirm',
        default : false,
        message : chalk.yellow('Do you confirm your previous action ?')
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
            message : [ 'Choosed extra', type,
                        'for your NodeJs application (optionnal) :' ].join(' '),
            choices : this.dependencies.extra.node[type]
          });
        }
        // generate angular ?
        if (this.cfg.generate.angular && !_.isEmpty(this.dependencies.extra.angular[type])) {
          // add in prompt dependencies
          prompt.push({
            name    : 'aDependencies',
            type    : 'checkbox',
            message : [ 'Choosed extra', type,
                        'for your AngularJs application (optionnal) :' ].join(' '),
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
   * Writing process
   */
  writing   : {
    /**
     * Default coffee message
     */
    coffeeMsg           : function () {
      // create async process
      var done = this.async();
      // process welcome message
      this.asciiMessage(this.cfg.ascii.coffee);
      // start spinner
      this.spinner.start();
      // start a timeout here
      var timeout = setTimeout(function () {
        // stop spinner
        this.spinner.stop(true);
        // next process
        done();
      }.bind(this), 2000);
    },
    /**
     * Deleting existing file
     */
    deleteExistingFile  : function () {
      // create async process
      var done = this.async();
      // erase mode
      if (this.cfg.erase) {
        // banner message
        this.banner('We will check and erase your existing project structure');
        // get dirname dirname
        var dirname = this.prefixPath('/');
        // start spinner
        this.spinner.start();
        // directory is empty ?
        fs.emptyDir(dirname, function (err) {
          // has error ?
          if (!err) {
            // start a timeout here
            var timeout = setTimeout(function () {
              // stop spinner
              this.spinner.stop(true);
              // clear timeout
              clearTimeout(timeout);
              // info message
              this.info('Your project directory was cleaned. Processing next step.');
              // end async
              done();
            }.bind(this), 2000);
          } else {
            // message
            this.error([ 'Cannot clean your directory :', err ].join(' '));
            // stop we cannot continue
            process.exit(this.cfg.codes.dFailed);
          }
        }.bind(this));
      }
    },
    /**
     * Build template files for you app
     */
    generateTemplates   : function () {
      // create async process
      var done = this.async();

      // to execute
      async.eachSeries([ 'node', 'angular' ], function (type, next) {

        // default config auto process
        var config = {
          node : {
            template  : {
              source      : '_package.json',
              destination : 'package.json'
            },
            name      : 'NodeJs'
          },
          angular : {
            template  : {
              source      : '_bower.json',
              destination : 'bower.json'
            },
            name      : 'AngularJs'
          },
        };

        // find type
        var current = config[type];

        // is undefined ?
        if (!_.isUndefined(current)) {
          // generate node ?
          if (this.cfg.generate[type]) {
            // banner message
            this.banner([ 'We will build your',current.template.destination,
                          'for your', current.name, 'configuration' ].join(' '));

            // start spinner
            this.spinner.start();
            // file exists ?
            if (!this.fs.exists(this.prefixPath(current.template.destination))) {
              // write file 
              fs.writeJson(this.prefixPath(current.template.destination),
                           this[type], function (err) {

                // has no error ?
                if (!err) {
                  // start a timeout here
                  var timeout = setTimeout(function () {
                    // stop spinner
                    this.spinner.stop(true);
                    // clear timeout
                    clearTimeout(timeout);
                    // success message
                    this.info([ 'File', current.template.destination,
                                'was correctly created & builded.' ].join(' '));
                    // next process
                    next();
                  }.bind(this), 2000);
                } else {
                  // success message
                  this.error([ 'Cannot create', current.template.destination,
                              'file :', err ].join(' '));
                  // exit cannot continue
                  process.exit(this.cfg.codes.fFailed);
                }
              }.bind(this));
            } else {
              // start a timeout here
              var timeout = setTimeout(function () {
                // stop spinner
                this.spinner.stop(true);
                // clear timeout
                clearTimeout(timeout);
                // error message
                this.error([ [ 'Cannot create & build file',
                               current.template.destination ].join(' '),
                               '. this file must be remove first'
                             ].join('')
                          );
                // next process
                next();
              }.bind(this), 2000);
            }
          }
        } else {
          // set error
          this.error([ 'Cannot find config for', type ].join(' '));
          next();
        }
      }.bind(this), function () {
        // end process
        done();
      });
    },
    /**
     * Build directory files for you app
     */
    generateDirectory   : function () {
      // create async process
      var done = this.async();

      // to execute
      async.eachSeries([ 'node', 'angular' ], function (type, next) {

        // default config auto process
        var config = { node     : { name : 'NodeJs' },
                       angular  : { name : 'AngularJs' }
                     };

        // find type
        var current = config[type];

        // is undefined ?
        if (!_.isUndefined(current)) {
          // generate with tyoe ?
          if (this.cfg.generate[type]) {
            // banner message
            this.banner([ 'We will build your folders',
                          'for your', current.name, 'configuration' ].join(' '));

            // empty dir ?
            if (!_.isEmpty(this.folders[type])) {
              // start spinner
              this.spinner.start();
              // parse all folders
              async.eachSeries(this.folders[type], function (folder, nextFolder) {
                // create item
                fs.mkdirs(this.prefixPath(folder), function (err) {
                  // has error ?
                  if (!err) {
                    // check if is last item
                    if (_.last(this.folders[type]) === folder) {
                      // start a timeout here
                      var timeout = setTimeout(function () {
                        // stop spinner
                        this.spinner.stop(true);
                        // clear timeout
                        clearTimeout(timeout);
                        // info
                        this.info([ 'Folders for your', current.name,
                                    'configuration was created.' ].join(' '));
                        // next process
                        next();
                      }.bind(this), 2000);
                    } else {
                      // process next folder
                      nextFolder();
                    }
                  } else {
                    // stop spinner
                    this.spinner.stop(true);
                    // error message
                    this.error([ 'An error occured when we try to create the folder [', folder,
                                 '] :', err ].join(' '));
                    // next process
                    next();
                  }
                }.bind(this));
              }.bind(this));
            }
          }
        } else {
          // set error
          this.error([ 'Cannot find config for', type ].join(' '));
          // next process
          next();
        }
      }.bind(this), function () {
        // end process
        done();
      });
    },
    /**
     * Generate Gruntfile
     */
    generateGruntFile   : function () {
      // create async process
      var done        = this.async();

      // banner message
      this.banner('We will generate your Gruntfile.js configuration');

      // start spinner
      this.spinner.start();
      // reach each config
      async.eachSeries(this.gruntConfig.config, function (config, next) {
        // normalize
        var c = config.value.join(',');
        // pkg property ?
        if (config.name !== 'pkg') {
          c = [ '{', c, '}' ].join(' ');
        }

        // is empty ?
        if (!_.isEmpty(c)) {
          // add config
          this.gruntEditor.insertConfig(config.name, c);
        }
        // insert new gruntfile configuration
        next();
      }.bind(this), function () {
        // reach load
        this.gruntEditor.loadNpmTasks(this.gruntConfig.load);
        // reach register
        async.eachSeries(this.gruntConfig.register, function (register, next) {
          // register task
          this.gruntEditor.registerTask(register.name, register.description, register.value);
          // next item
          next();
        }.bind(this) , function () {
          // beautidy content
          var content = jsbeauty(this.gruntEditor.toString(), { 'indent_size' : 2 });
          // replace some brakets and ":"
          content = content.replace(/\[/g, '[ ').replace(/\]/g, ' ]').replace(/(a-zA-Z)?:/g, ' :');
          // write file
          fs.writeFile(this.prefixPath('Gruntfile.js'), content, function (err) {
            // start a timeout here
            var timeout = setTimeout(function () {
              // stop spinner
              this.spinner.stop(true);
              // err ?
              if (!err) {
                // message
                this.info('Your Gruntfile.js was correctly created.');
                // end
                done();
              } else {
                // error message
                this.error([ 'Cannnot generate Gruntfile.js :', err ].join(' '));
                // exit cannot continue
                process.exit(this.cfg.codes.gFailed);
              }
            }.bind(this), 2000);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  },
});









