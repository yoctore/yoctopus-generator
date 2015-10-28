/**
 * Main file of the 'yocto-stack-generator'
 *
 * @class Main
 * @date 14/04/2015
 * @author Cédric Balard
 * @copyright Yocto SAS <http://www.yocto>
 */

'use strict';
var yeoman  = require('yeoman-generator');
var mkdirp  = require('mkdirp');
var _       = require('lodash');
var winston  = require('winston');


 var logger = new (winston.Logger)( {
    transports: [
      new (winston.transports.Console)( {
          colorize : true
          }),
      ]
  });

var npmDependenciesFile = require('./config/dependencies.json');
logger.info('List of Npm Dependencies : loaded ');

/**
 *We extend a parent generator of yeoman to create our own generator
 *
 * @module mainModuleYoctoStackGenerator
 * @main
 */
module.exports = yeoman.generators.Base.extend({

    /**
     * Initializing, load .json config files
     *
     * @submodule initializing
     */
    initializing : {
        /**
         * Read "./config/folders.json" and get all folders
         *
         * @method getPathFoldrers
         * @param
         * @return
         */
        getPathFoldrers : function() {
            this.pathFolders = require('./config/folders.json');
            logger.info('Folders list to create : loaded ');
        },

        /**
         * Read "dependencies.json" and get all dependencies
         * @method getNpmDependencies
         */
        getNpmDependencies : function() {
            this.listNpmDependencies = [];
            _.forEach( npmDependenciesFile.required, function(dep) {
                this.listNpmDependencies.push(dep.dependencies);
            }, this );
        },

        /**
         * Read "dependencies.json" and get all optional dependencies
         *
         * @method getNpmDependenciesOptional
         */
        getNpmDependenciesOptional : function() {
            this.listNpmDependenciesOptional = [];
            _.forEach( npmDependenciesFile.optional, function(dep) {
                if (_.isString(dep.dependencies) )
                    this.listNpmDependenciesOptional.push( dep.dependencies);
                else
                    this.listNpmDependenciesOptional.push(  _([dep.dependencies.name, dep.dependencies.version]).join("@"));

            }, this );
        },

        /**
         * Read "dependencies.json" and get different type of DB
         *
         * @method getDBConfig
         */
        getDBConfig : function() {
            this.dbConfigPossibles = [];
            _.forEach( npmDependenciesFile.db, function(db) {
                this.dbConfigPossibles.push(db.type);
            }, this );
        }
    },

    /**
     * Handle user intereactions
     *
     * @submodule prompting
     */
    prompting : {
        /**
         * Ask user about general project's info :
         * 		- Name
         * 		- Description
         * 		- Version
         * 		- If is private
         *
         * @method promptInfoProject
         */
        promptInfoProject : function() {
            var done = this.async();
            var prompts = [{
                name        : 'appName',
                message     : 'What is your app\'s name ?',
                validate    : function(input){
                    if( input.length >2 )
                        return true;
                    else
                        return 'Please enter a valid application name (Min 3 Chars)';
                }
            },

            {
                name        : 'appDescription',
                message     : 'What is your app\'s desription ?',
                validate    : function(input) {
                    if( input.length >9 )
                        return true;
                    else
                        return 'Please enter a valid application description (Min 10 Chars)';
                }
            },

            {
                name        : 'appVersion',
                message     : 'What is your app\'s version (format x.x.x) ?',
                default     : '0.1.0',
                validate    : function(input) {
                    var reg = /^(\d+)\.(\d+)\.(\d+)$/;
                    if( reg.exec(input))
                        return true;
                    else
                        return false;
                }
            },

            {
                name    : 'appIsPrivate',
                type    : 'list',
                message : 'Your app\'s is private ?',
                choices : ['true', 'false'],
            }];

            this.prompt(prompts, function (props) {
                this.appName        = props.appName;
                this.appDescription = props.appDescription;
                this.appVersion     = props.appVersion;
                this.appIsPrivate   = props.appIsPrivate;
                done();
            }.bind(this));
        },

        /**
         * Ask user about wich npm dependencie optional he want install
         *
         * @method promptNpmDependenciesOptional
         */
        promptNpmDependenciesOptional : function() {
            if( ! _.isEmpty(this.listNpmDependenciesOptional) )
            {
                var done = this.async();
                var prompts = [{
                    type    : 'checkbox',
                    name    : 'npmDepOption',
                    message : 'Select which dependencies you want to install (click on "space" for select/unselect) :',
                    choices : this.listNpmDependenciesOptional
                }];

                this.prompt(prompts, function (props) {
                    _.forEach(props.npmDepOption, function(val){
                        this.listNpmDependencies.push(val);
                    }, this);
                    done();
                }.bind(this));
            }
        },

        /**
        * Ask user about wich type of database he want install
        *
        * @method promptDbChoices
         */
        promptDbChoices : function() {
            var done = this.async();
            var prompts = [{
                type    : 'list',
                name    : 'npmDbChoice',
                message : 'Select which type of database you want to install :',
                choices : this.dbConfigPossibles
            }];

            this.prompt(prompts, function (props) {
                    this.dbType=props.npmDbChoice;
                done();
            }.bind(this));
        }
    },

    /**
     * Handle configuration : make all directory ...
     *
     * @submodule configuring
     */
    configuring : {
        /**
         * Create all folders present in "config/folders.json"
         * Add '.gitignore' file in each created folder
         *
         * @method scaffoldFolders
         */
        scaffoldFolders : function() {
            _.forEach( this.pathFolders.folders, function(value) {
                mkdirp(value.path);
                logger.info( _(['New folder created :', value.path]).join(' ') );
                this.copy('_.gitignore', _([value.path,'.gitignore']).join('/') );

            }, this);
        },

        /**
         * Handle DB dependencies in correlation with the dbType choosen
         * Add specifics dependencies to install
         *
         * @method setDependenciesDB
         */
        setDependenciesDB : function() {
            _.forEach( npmDependenciesFile.db, function(db) {
                if(this.dbType === db.type )
                {
                    _.forEach(db.dependencies, function(dep) {
                        this.listNpmDependencies.push(dep);
                    } ,this )   ;
                }
            }, this );
        }
    },

    /**
     * Generate specifics files : package.json, routes...
     *
     * @submodule writing
     */
    writing : {
        /**
         *Generate files :
         *	 - gruntfile.js
         *	 - package.json
         *
         * @method generateAllFiles
         */
        generateAllFiles : function() {
            var context = {
                siteName            : this.appName,
                siteDescription     : this.appDescription,
                siteVersion         : this.appVersion,
                siteIsPrivate       : this.appIsPrivate
            };

            this.copy('_gruntfile.js', 'Gruntfile.js');
            this.template('_package.json', 'package.json', context);
        }
    },

    /**
     * Install all dependencies : npm and Bower
     *
     * @submodule install
     */
    install : {
        /**
         * Install all npm dependencies
         *
         * @method installNpmDependencies
         */
        installNpmDependencies : function() {
            this.log('Install npm dependencies');
            _.forEach(this.listNpmDependencies, function(dep) {
                if (_.isString(dep))
                {
                    this.npmInstall([dep], { 'save': true });
                    logger.info('Package installed : ' + dep );
                }
                else
                {
                    this.npmInstall( _([dep.name,dep.version]).join("@") );
                    logger.info(  _(['Package installed : ', dep.name, dep.version]).join("@") );
                }
            }, this);
        },

        /**
         * Install all bower dependencies
         *
         * @method installBowerDependencies
         */
        installBowerDependencies : function() {
        }
    }
});
