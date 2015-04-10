/**
 * Main file of the 'yocto-stack-generator'
 *
 * @author
 */

'use strict';
var yeoman = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');

var npmDependenciesFile = require('./config/dependencies.json');
console.log('List of Npm Dependencies : loaded ');


module.exports= yeoman.generators.Base.extend({

    /**
     * Initializing, load .json config files
     * @type {Object}
     */
    initializing: {

        getPathFoldrers: function(){
            this.pathFolders = require('./config/folders.json');
            this.log('Folders list to create : loaded ');
        },

        getNpmDepencies: function(){
            this.listNpmDependenciesOptional = [];
            this.listNpmDependencies = [];

            _.forEach( npmDependenciesFile.dependencies, function(dep) {
                if( dep.confirm === 'true' )
                    this.listNpmDependenciesOptional.push( dep.name);
                else
                    this.listNpmDependencies.push(dep.name);
            }, this );
        },

        getDDConfig: function(){
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
        promptInfoProject: function(){

            var done = this.async();
            var prompts = [{
                name: 'appName',
                message: 'What is your app\'s name ?',
                validate: function(input){
                    if( input !== ''){
                        return true;
                     }
                    return false;
                }
            },
            {
                name: 'appDescription',
                message: 'What is your app\'s desription ?',
                validate: function(input){
                    if( input !== ''){
                        return true;
                     }
                    return false;
                }
            },
            {
                name: 'appVersion',
                message: 'What is your app\'s version (format x.x.x) ?',
                default : '0.0.0'
            },
            {
                name: 'appIsPrivate',
                type: 'list',
                message: 'Your app\'s is private ?',
                choices: ['true', 'false'],
            }];
            this.prompt(prompts, function (props) {
                this.appName = props.appName;
                this.appDescription = props.appDescription;
                this.appVersion = props.appVersion;
                this.appIsPrivate = props.appIsPrivate;
                done();
            }.bind(this));
        },

        promptNpmDependenciesOptional: function()
        {
            var done = this.async();
            var prompts = [{
                type: 'checkbox',
                name: 'npmDepOption',
                message: 'Select which dependencies you want to install (click on "space" for select/unselect) :',
                choices: this.listNpmDependenciesOptional
            }];
            this.prompt(prompts, function (props) {
                _.forEach(props.npmDepOption, function(val){
                    this.listNpmDependencies.push(val);
                }, this);
                done();
            }.bind(this));
        },

        promptDbChoices: function()
        {
            var done = this.async();
            var prompts = [{
                type: 'list',
                name: 'npmDbChoice',
                message: 'Select which type of database you want to install :',
                choices: this.dbConfigPossibles
            }];
            this.prompt(prompts, function (props) {
                    this.dbType=props.npmDbChoice;
                done();
            }.bind(this));
        }
    },

    /**
     * Handle configuration : make all directory ...
     * @type {Object}
     */
    configuring: {
        /**
         * create all folders present in "config/folders.json"
         */
        scaffoldFolders: function(){
            _.forEach( this.pathFolders.folders, function(value)
            {
                mkdirp(value.path);
                this.log('New folder created' , value.path);
            },this);
        },

        /**
         * Handle DB dependencies in correlation with the dbType choosen
         */
        setDependenciesDB: function(){
            _.forEach( npmDependenciesFile.db, function(db) {
                if(this.dbType === db.type )
                {
                    this.log ('ok dbtype found ');
                    _.forEach(db.dependencies, function(dep){
                            this.log('dep ' + dep);
                            // if (typeof myVar == 'string' || myVar instanceof String)
                            // // it's a string
                            // else
                            //
                            this.listNpmDependencies.push(dep);

                    } ,this )   ;
                }
            }, this );
        }
    },

    /**
     * Generate specifics files : package.json, routes...
     */
    writing:{
        copyMainFile: function(){
            var context = {
                siteName: this.appName,
                siteDescription: this.appDescription,
                siteVersion: this.appVersion,
                siteIsPrivate: this.appIsPrivate
            };
            this.copy('_gruntfile.js', 'Gruntfile.js');
            this.template('_package.json', 'package.json', context);
        }
    },

    /**
     * Install all dependencies : npm and Bower
     */
    install:{
        installNpmDependencies: function() {
            this.log('install npm dependencies');
            _.forEach(this.listNpmDependencies, function(dep)
            {
                if (typeof dep == 'string' || dep instanceof String)
                {
                    this.npmInstall([dep], { 'save': true });
                    this.log('package ', dep , ' installed');
                }
                else
                {
                    this.npmInstall([dep], { 'save': true });
                    this.log('package ' + dep.name + ', version : ' + dep.version + ' was installed');
                }

            }, this);
        },

        installBowerDependencies: function(){
        }
    }
});
