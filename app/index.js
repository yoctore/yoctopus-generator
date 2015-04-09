'use strict';
var yeoman = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');


module.exports= yeoman.generators.Base.extend({
    promptUser: function() {
        var done = this.async();

        // have Yeoman greet the user
        console.log(this.yeoman);

        var prompts = [{
            name: 'appName',
            message: 'What is your app\'s name ?',
            required : true
        },
        {
          name: 'appDescription',
          message: 'What is your app\'s desription ?'
        },
        {
          name: 'appVersion',
          message: 'What is your app\'s version (format x.x.x) ?',
          default : '0.0.0'
        },
        {
          name: 'appIsPrivate',
          type: 'boolean',
          message: 'Your app\'s is private ? (true or false)',
          default : true

        }
        ];

        this.prompt(prompts, function (props) {
            this.appName = props.appName;
            this.appDescription = props.appDescription;
            this.appVersion = props.appVersion;
            this.appIsPrivate = props.appIsPrivate;


            done();
        }.bind(this));
    },
    //create all folders present in "config/folders.json"
    scaffoldFolders: function(){
      var pathFolders = require('./config/folders.json');
      _.forEach( pathFolders.folders, function(value)
      {
        mkdirp(value.path);
        console.log('New folder created' , value.path);
      });

    },

    copyMainFile: function(){
      var context = {
        siteName: this.appName,
        siteDescription: this.appDescription,
        siteVersion: this.appVersion,
        siteIsPrivate: this.appIsPrivate
      };
      this.copy('_gruntfile.js', 'Gruntfile.js');
      this.template('_package.json', 'package.json', context);
    },
    //Intall all NpmDependcies present in "config/dependencies.json"
     installNpmDependencies: function() {
    //   this.npmInstall(['express'], { 'saveDev': true });
      console.log('install npm dependencies');
       var npmDependencies = require('./config/dependencies.json');
       _.forEach( npmDependencies.dependencies, function(dep)
       {
         console.log('dependencies found : ', dep.name, ', should confirm install ? : ' , dep.confirm);


          if( dep.confirm === 'true' )
          {

          //  console.log('confirmPrompt ', confirmPrompt(dep.name));

          }


       });
     }

});


function confirmPrompt(depName){
  var done = this.async();

     this.prompt({
       type    : 'input',
       name    : 'value',
       message : 'confirm install ' + depName + ' ?',
       default : this.appname // Default to current folder name
     }, function (answers) {
       done();
       return answers.value;
     }.bind(this));
}
