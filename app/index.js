/**
 * Main file of the 'yocto-stack-generator'
 *
 * @author Cédric Balard
 */

'use strict';
var yeoman  = require('yeoman-generator');
var mkdirp  = require('mkdirp');
var _       = require('lodash');
var logger  = require('winston');

var npmDependenciesFile = require('./config/dependencies.json');
logger.info('List of Npm Dependencies : loaded ');



module.exports= yeoman.generators.Base.extend({

    /**
     * Initializing, load .json config files
     */
    initializing : {
        /**
         * Read "./config/folders.json" and get all folders
         */
        getPathFoldrers : function() {
            this.pathFolders = require('./config/folders.json');
            logger.info('Folders list to create : loaded ');
        },

        /**
         * Read "dependencies.json" and get all dependencies
         */
        getNpmDepencies : function() {
            this.listNpmDependencies = [];
            _.forEach( npmDependenciesFile.required, function(dep) {
                this.listNpmDependencies.push(dep.dependencies);
            }, this );
        },

        /**
         * Read "dependencies.json" and get all optional dependencies
         */
        getNpmDepenciesOptional : function() {
            this.listNpmDependenciesOptional = [];
            _.forEach( npmDependenciesFile.optional, function(dep) {
                if (_.isString(dep.dependencies) )
                    this.listNpmDependenciesOptional.push( dep.dependencies);
                else
                    this.listNpmDependenciesOptional.push(  _([dep.dependencies.name, dep.dependencies.version]).join("@"));

            }, this );
        },

        /**
         * Get different type of DB
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
     */
    prompting: {
        /**
         * Ask user about general project's info
         */
        promptInfoProject : function() {
            var done = this.async();
            var prompts = [{
                name        : 'appName',
                message     : 'What is your app\'s name ?',
                validate    : function(input){
                    if( _.isEmpty(input) )
                        return false;
                    else
                        return true;
                }
            },

            {
                name        : 'appDescription',
                message     : 'What is your app\'s desription ?',
                validate    : function(input) {
                    if( _.isEmpty(input) )
                        return false;
                    else
                        return true;
                }
            },

            {
                name        : 'appVersion',
                message     : 'What is your app\'s version (format x.x.x) ?',
                default     : '1.0.1',
                validate    : function(input) {
                    var reg = /^(?:(\d+)\.)?(?:(\d+)\.)?(\d+)$/;
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
                this.appName = props.appName;
                this.appDescription = props.appDescription;
                this.appVersion = props.appVersion;
                this.appIsPrivate = props.appIsPrivate;
                done();
            }.bind(this));
        },

        /**
         * Ask user about wich npm dependencie optional he want install
         */
        promptNpmDependenciesOptional: function()
        {
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
         */
        promptDbChoices: function()
        {
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
     */
    configuring: {
        /**
         * create all folders present in "config/folders.json"
         */
        scaffoldFolders: function(){
            _.forEach( this.pathFolders.folders, function(value)
            {
                mkdirp(value.path);
                logger.info( _(['New folder created :', value.path]).join(" ") );
            });
        },

        /**
         * Handle DB dependencies in correlation with the dbType choosen
         * Add specifics dependencies to install
         */
        setDependenciesDB : function() {
            _.forEach( npmDependenciesFile.db, function(db) {
                if(this.dbType === db.type )
                {
                    _.forEach(db.dependencies, function(dep){
                        this.listNpmDependencies.push(dep);
                    } ,this )   ;
                }
            }, this );
        }
    },

    /**
     * Generate specifics files : package.json, routes...
     */
    writing : {
        copyMainFile : function() {
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
     */
    install:{
        /**
         * Install all npm dependencies
         */
        installNpmDependencies: function() {
            this.log('Install npm dependencies');
            _.forEach(this.listNpmDependencies, function(dep)
            {
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
        installBowerDependencies: function(){
        }
    }
});
