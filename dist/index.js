/* generator-yoctopus - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.0.4 */
"use strict";var jsbeautyKey="js_beautify",generators=require("yeoman-generator"),_=require("lodash"),n=require("n-api"),request=require("request"),chalk=require("chalk"),logger=require("yocto-logger"),spdx=require("spdx"),isEmail=require("isemail"),isUrl=require("is-url"),path=require("path"),uuid=require("uuid"),async=require("async"),fs=require("fs-extra"),Spinner=require("cli-spinner").Spinner,time=require("time"),GruntfileEditor=require("gruntfile-editor"),jsbeauty=require("js-beautify")[jsbeautyKey],yosay=require("yosay");module.exports=generators.Base.extend({constructor:function(){generators.Base.apply(this,arguments),this.gruntEditor=new GruntfileEditor,this.spinner=new Spinner("%s"),this.cfg={angular:{url:"https://code.angularjs.org/",resolution:"latest",versions:["latest"]},delay:2e3,name:"YoctopusJs",nVersions:n.ls(),debug:!0,paths:{dependencies:[this.sourceRoot(),"config/dependencies.json"].join("/"),folders:[this.sourceRoot(),"config/folders.json"].join("/"),grunt:[this.sourceRoot(),"config/gruntfile.json"].join("/")},generate:{node:!1,angular:!1},codes:{eManual:500,dFailed:501,fFailed:502,gFailed:503},ascii:{coffee:"coffee",debug:"debug-mode",bye:"goodbye",welcome:"welcome",error:"octopus-error",file:"remove-file-required"}},this.asciiMessage=function(a,b){b=_.isBoolean(b)?b:!1;var c=this.normalizePath([[this.sourceRoot(),"ascii",a].join("/"),"txt"].join("."));if(this.fs.exists(c)){var d=this.fs.read(c);a===this.cfg.ascii.debug&&(d=chalk.blue(d)),a===this.cfg.ascii.coffee&&(d=chalk.green(d)),(a===this.cfg.ascii.welcome||a===this.cfg.ascii.bye)&&(d=chalk.cyan(d).replace("%s",this.getElapsedTime())),a===this.cfg.ascii.error&&(d=chalk.req(d)),a===this.cfg.ascii.file&&(d=chalk.yellow(d)),this.log(d)}b&&process.exit(this.cfg.codes.eManual)},this.normalizePath=function(a){return path.normalize(a)},this.prefixPath=function(a){return this.cfg.debug?this.normalizePath([this.destinationRoot(),"/debug",a].join("/")):this.normalizePath([this.destinationRoot(),a].join("/"))},this.getElapsedTime=function(){var a=time.time()-this.time,b=time.localtime(a);return b=_.compact(_.flatten([[b.minutes>0?[b.minutes,"minutes"].join(" "):""],[b.seconds>0?[b.seconds,"seconds"].join(" "):""]])),_.isEmpty(b)?"":_.compact(["(Time elapsed : ",[b].join(""),")"]).join("")},this.banner=function(a){logger.banner(["[",this.cfg.name,"] -",a].join(" "))},this.logger=function(a,b){a=_.isString(a)&&!_.isEmpty(a)?a:"green",this.log([chalk[a](">>"),b].join(" "))},this.error=function(a){this.logger("red",a)},this.warning=function(a){this.logger("yellow",a)},this.info=function(a){this.logger("green",a)}},initializing:{catchExit:function(){process.on("exit",function(a){a>=this.cfg.codes.dFailed&&a>=a>=this.cfg.codes.gFailed?this.asciiMessage(this.cfg.ascii.error):this.asciiMessage(this.cfg.ascii.bye)}.bind(this))},welcome:function(){this.log(yosay("Hello, and welcome to YoctopusJs generator."))},debugMode:function(){var a=this.async();this.prompt([{name:"debug",type:"confirm",message:["Do you want run this process in debug mode ?","(we will create and use debug directory for","data generation process)"].join(" "),"default":!1}],function(b){this.cfg.debug=b.debug,this.cfg.debug&&this.asciiMessage(this.cfg.ascii.debug),a()}.bind(this))},ready:function(){var a=this.async();this.prompt([{name:"ready",message:"This process will take ~5 minutes. Are your ready ?",type:"confirm"}],function(b){b.ready?(this.time=time.time(),this.asciiMessage("welcome"),a()):process.exit(this.cfg.codes.eManual)}.bind(this))},init:function(){this.banner("We are initializing some data. Take a cofee and wait a few moment.");var a=this.async();this.dependencies=require(this.cfg.paths.dependencies),this.info("Retreive dependencies config succeed."),this.folders=require(this.cfg.paths.folders),this.info("Retreive folders structures succeed."),this.gruntConfig=require(this.cfg.paths.grunt),this.info("Retreive grunt config succeed."),this.warning(["Try to connect on",this.cfg.angular.url,"to retreive angular available versions"].join(" ")),this.spinner.start(),request(this.cfg.angular.url,function(b,c,d){if(b||200!==c.statusCode)this.spinner.stop(!0),this.error(["Cannot retreive angular version :",b].join(" ")),a();else{for(var e,f=/href="([0-9]\.[0-9]\.[0-9])\/\"/gm;null!==(e=f.exec(d));)this.cfg.angular.versions.push(e[1]);this.cfg.angular.versions=_(this.cfg.angular.versions).reverse().value(),this.cfg.angular.resolution=_.first(this.cfg.angular.versions),this.spinner.stop(!0),this.info("Retreive angular version succeed."),a()}}.bind(this))},chooseAppType:function(){this.banner("Now it's time to tell us which type of application you want");var a=this.async(),b=["An application only based on NodeJs","An application only based on AngularJs","An application based on NodeJs & AngularJs"];this.prompt([{name:"typeApp",message:"What type of application you want to generate ?",type:"list",choices:b}],function(c){this.cfg.generate.node=c.typeApp===_.first(b)||c.typeApp===_.last(b),this.cfg.generate.angular=c.typeApp===_.last(b)||c.typeApp===b[1],a()}.bind(this))}},prompting:{openSourceProject:function(){var a=this.async();this.banner("Now tell us if this project will be open source in the future"),this.prompt([{name:"opensource",type:"confirm",message:"Your project will be open source ?","default":!0}],function(b){_.extend(this.cfg,b),a()}.bind(this))},nodeBasePackage:function(){if(this.cfg.generate.node){this.banner("Now tell us some informations about your NodeJs configuration.");var a=this.async(),b=[{name:"name",message:"What is your application name ?",validate:function(a){return _.isEmpty(a)?"Please enter a valid application name.":!0}},{name:"description",message:"What is your application description ?",validate:function(a){return!_.isEmpty(a)&&a.length>10?!0:"Please enter a valid description with at least 10 chars"}}];this.cfg.debug&&_.each(b,function(a){_.extend(a,{"default":uuid.v4()})},this);var c=_.flatten([b,{name:"version",message:"What is your application version (x.x.x) ?","default":"0.1.0",validate:function(a){var b=/^(\d+)\.(\d+)\.(\d+)$/;return!_.isNull(b.exec(a))}},{name:"private",type:"confirm",message:"Your application is private ?"},{name:"license",type:"list","default":"Apache-2.0",message:"Which licence for your application ?",choices:spdx.licenses},{name:"authorName",message:"What is the author for this app ?","default":this.user.git.name()},{name:"authorEmail",message:"What is the author email for this app ?","default":this.user.git.email(),validate:function(a){return isEmail(a)?!0:"Please enter a valid email"}},{name:"authorUrl",message:"What is the author url for this app ? (Optional)",validate:function(a){return _.isEmpty(a)?!0:isUrl(a)?!0:"Please enter a valid url"}},{name:"engines",type:"list",message:"Which version of node your application must depend ?",choices:_(this.cfg.nVersions).reverse().value(),"default":n.current()}]);this.prompt(c,function(b){b.engines={node:[">=",b.engines].join("")},b.name=_.deburr(_.snakeCase(b.name)).replace("_","-"),_.extend(b,{author:{name:b.authorName,email:b.authorEmail,url:b.authorUrl}}),delete b.authorName,delete b.authorEmail,delete b.authorUrl,this.node=_.extend({},b),a()}.bind(this))}},bowerBasePackage:function(){if(this.cfg.generate.angular){this.banner("Now tell us some informations about your AngularJS configuration.");var a=this.async(),b=[],c=[{name:"name",message:"What is your application name ?",validate:function(a){return _.isEmpty(a)?"Please enter a valid application name.":!0}},{name:"description",message:"What is your application description ?",validate:function(a){return!_.isEmpty(a)&&a.length>10?!0:"Please enter a valid description with at least 10 chars"}}];this.cfg.debug&&_.each(c,function(a){_.extend(a,{"default":uuid.v4()})},this);var d=_.flatten([c,{name:"version",message:"What is your application version (x.x.x) ?","default":"0.1.0",validate:function(a){var b=/^(\d+)\.(\d+)\.(\d+)$/;return!_.isNull(b.exec(a))}},{name:"private",type:"confirm",message:"Your application is private ?"},{name:"license",type:"list","default":"Apache-2.0",message:"Which licence for your application ?",choices:spdx.licenses},{name:"authorName",message:"What is the author for this app ?","default":this.user.git.name()},{name:"authorEmail",message:"What is the author email for this app ?","default":this.user.git.email(),validate:function(a){return isEmail(a)?!0:"Please enter a valid email"}},{name:"authorUrl",message:"What is the author url for this app (Optional) ?",validate:function(a){return _.isEmpty(a)?!0:isUrl(a)?!0:"Please enter a valid url"}}]);this.cfg.generate.node||_.each(d,function(a){b.push(a)}),b.push({name:"angularVersions",type:"list",message:"Which version of angular your app must depend ?",choices:this.cfg.angular.versions,"default":this.cfg.angular.resolution}),this.prompt(b,function(b){if(b.name=_.deburr(_.snakeCase(b.name)).replace("_","-"),_.extend(b,{author:{name:b.authorName,email:b.authorEmail,url:b.authorUrl},resolutions:{angular:b.angularVersions}}),delete b.authorName,delete b.authorEmail,delete b.authorUrl,delete b.angularVersions,this.angular=_.extend({},b),this.node){var c=_.clone(this.node);delete c.engines,this.angular=_.merge(this.angular,c)}a()}.bind(this))}},generateFolders:function(){var a=this.async();this.banner("So maybe you want to generate a file structure for your app"),this.prompt([{name:"structure",type:"confirm","default":!0,message:["Do confirm that you want generate","project structure based on your app type choice ?"].join(" ")}],function(b){_.extend(this.cfg,{structure:{enable:b.structure}}),a()}.bind(this))},infoRemoveFolder:function(){this.asciiMessage(this.cfg.ascii.file)},forceRemoveExistingFolders:function(){var a=this.async();this.banner(["We need to know if you allow us","to remove existing project stucture is exists"].join(" ")),this.prompt([{name:"erase",type:"confirm","default":!0,message:["Do confirm that you allow us to remove existing","directory structure if exists ?",chalk.red("(Yes to continue)")].join(" ")}],function(b){b.erase?(_.extend(this.cfg,{erase:b.erase}),a()):process.exit(this.cfg.codes.eManual)}.bind(this))},confirmForceRemoveExistingFolders:function(){var a=this.async();this.cfg.erase?this.prompt([{name:"eraseConfirm",type:"confirm","default":!1,message:[chalk.yellow("Do you confirm your previous action ?"),chalk.red("(Yes to continue)")].join(" ")}],function(b){b.eraseConfirm?(this.cfg.erase=b.eraseConfirm,a()):process.exit(this.cfg.codes.eManual)}.bind(this)):a()}},configuring:{generateFolders:function(){var a=[];this.cfg.structure.enable&&(this.cfg.generate.node&&a.push(this.folders.node),this.cfg.generate.angular&&a.push(this.folders.angular),a.push(this.folders.extra),a=_.flatten(a),a=_.map(a,function(a){return this.prefixPath(a)},this),_.extend(this.cfg.structure,{directory:a}))},generateExtraDependencies:function(){var a=this.async();async.eachSeries(["dependencies","devDependencies"],function(a,b){var c=[];this.cfg.generate.node&&!_.isEmpty(this.dependencies.extra.node[a])&&c.push({name:"nDependencies",type:"checkbox",message:["Choosed extra",a,"for your NodeJs application (Optional) :"].join(" "),choices:this.dependencies.extra.node[a]}),this.cfg.generate.angular&&!_.isEmpty(this.dependencies.extra.angular[a])&&c.push({name:"aDependencies",type:"checkbox",message:["Choosed extra",a,"for your AngularJs application (Optional) :"].join(" "),choices:this.dependencies.extra.angular[a]}),_.isEmpty(c)?b():(this.banner(["Maybe you want install extra",a].join(" ")),this.prompt(c,function(c){this.cfg.generate.node&&(this.dependencies.node[a]=_.compact(_.flatten([this.dependencies.node[a],c.nDependencies]))),this.cfg.generate.angular&&(this.dependencies.angular[a]=_.compact(_.flatten([this.dependencies.angular[a],c.aDependencies]))),b()}.bind(this)))}.bind(this),function(){a()})}},writing:{coffeeMsg:function(){var a=this.async();this.asciiMessage(this.cfg.ascii.coffee),this.spinner.start();var b=setTimeout(function(){clearTimeout(b),this.spinner.stop(!0),a()}.bind(this),this.cfg.delay)},deleteExistingFile:function(){var a=this.async();if(this.cfg.erase){this.banner("We will check and erase your existing project structure");var b=this.prefixPath("/");this.spinner.start(),fs.emptyDir(b,function(b){if(b)this.error(["Cannot clean your directory :",b].join(" ")),process.exit(this.cfg.codes.dFailed);else var c=setTimeout(function(){this.spinner.stop(!0),clearTimeout(c),this.info("Your project directory was cleaned. Processing next step."),a()}.bind(this),this.cfg.delay)}.bind(this))}else a()},generateTemplates:function(){var a=this.async();async.eachSeries(["node","angular"],function(a,b){var c={node:{template:{source:"_package.json",destination:"package.json"},name:"NodeJs"},angular:{template:{source:"_bower.json",destination:"bower.json"},name:"AngularJs"}},d=c[a];_.isUndefined(d)?(this.error(["Cannot find config for",a].join(" ")),b()):this.cfg.generate[a]?(this.banner(["We will build your",d.template.destination,"for your",d.name,"configuration"].join(" ")),this.spinner.start(),fs.stat(this.prefixPath(d.template.destination),function(c){if(c)fs.writeJson(this.prefixPath(d.template.destination),this[a],function(c){if("angular"===a&&fs.writeJson(this.prefixPath("package.json"),this[a]),c)this.error(["Cannot create",d.template.destination,"file :",c].join(" ")),process.exit(this.cfg.codes.fFailed);else var e=setTimeout(function(){this.spinner.stop(!0),clearTimeout(e),this.info(["File",d.template.destination,"was correctly created & builded."].join(" ")),b()}.bind(this),this.cfg.delay)}.bind(this));else var e=setTimeout(function(){this.spinner.stop(!0),clearTimeout(e),this.error([["Cannot create & build file",d.template.destination].join(" "),". this file must be remove first"].join("")),b()}.bind(this),this.cfg.delay)}.bind(this))):b()}.bind(this),function(){a()})},generateDirectory:function(){var a=this.async();async.eachSeries(["node","angular"],function(a,b){var c={node:{name:"NodeJs"},angular:{name:"AngularJs"}},d=c[a];_.isUndefined(d)?(this.error(["Cannot find config for",a].join(" ")),b()):this.cfg.generate[a]?(this.banner(["We will build your folders","for your",d.name,"configuration"].join(" ")),_.isEmpty(this.folders[a])||(this.spinner.start(),async.eachSeries(this.folders[a],function(c,e){fs.mkdirs(this.prefixPath(c),function(f){if(f)this.spinner.stop(!0),this.error(["An error occured when we try to create the folder [",c,"] :",f].join(" ")),b();else if(_.last(this.folders[a])===c)var g=setTimeout(function(){this.spinner.stop(!0),clearTimeout(g),this.info(["Folders for your",d.name,"configuration was created."].join(" ")),b()}.bind(this),this.cfg.delay);else e()}.bind(this))}.bind(this)))):b()}.bind(this),function(){a()})},generateGruntFile:function(){var a=this.async(),b={},c={};this.banner("We will generate your Gruntfile.js configuration"),this.spinner.start(),async.eachSeries(["default","node","angular"],function(a,d){var e=this.gruntConfig.config[a];async.eachSeries(e,function(a,c){async.eachSeries(a.value,function(c,d){if(!_.isEmpty(c)){var e=[a.name,"_key"].join("");_.isUndefined(b[e])&&_.set(b,e,[]),b[e].push(c),d()}}.bind(this),function(){c()}.bind(this))}.bind(this),function(){_.isEmpty(this.gruntConfig.load[a])||this.gruntEditor.loadNpmTasks(this.gruntConfig.load[a]),async.eachSeries(this.gruntConfig.register[a],function(a,b){_.isUndefined(c[a.name])&&(c[a.name]={name:[],description:[],value:[]}),c[a.name].name.push(a.name),c[a.name].description.push(a.description),c[a.name].value.push(a.value),b()}.bind(this),function(){d()})}.bind(this))}.bind(this),function(){_.each(c,function(a){var b=_.sortBy(_.flatten(_.uniq(a.value)),function(a){return["buildjs"!==a,"build"!==a,a].join("|")});this.gruntEditor.registerTask(_.uniq(a.name).join(" - "),_.uniq(a.description).join(" - "),b)},this),_.each(b,function(a,b){var c=b.replace("_key","");a=a.join(", "),"pkg"!==c&&(a=["{",a,"}"].join(" ")),this.gruntEditor.insertConfig(c,a)},this);var d=jsbeauty(this.gruntEditor.toString(),{indent_size:2});d=d.replace(/\[/g,"[ ").replace(/\]/g," ]"),fs.writeFile(this.prefixPath("Gruntfile.js"),d,function(b){var c=setTimeout(function(){clearTimeout(c),this.spinner.stop(!0),b?(this.error(["Cannnot generate Gruntfile.js :",b].join(" ")),process.exit(this.cfg.codes.gFailed)):(this.info("Your Gruntfile.js was correctly created."),a())}.bind(this),this.cfg.delay)}.bind(this))}.bind(this))},generateFiles:function(){var a=this.async(),b=["node","angular","default"];this.cfg.opensource&&b.push("open-source"),async.eachSeries(b,function(a,b){if(this.cfg.generate[a]||"default"===a||"open-source"===a){this.banner(["We will generate base files for your",a,"configuration"].join(" ")),this.spinner.start();var c=this.normalizePath([this.sourceRoot(),"applications",a].join("/"));fs.walk(c).on("data",function(b){if(b.stats.isFile()){var d=b.path.replace(c,""),e=path.parse(b.path);if(!_.isEmpty(path.extname(d))||"default"===a&&("_.gitignore"===e.base||"_.gitattributes"===e.base)){d=this.prefixPath(["angular"===a?"public/assets/js/src":"",d].join("/")),d=d.replace(/\/_/,"/");var f=fs.readFileSync(b.path).toString();_.has(this[a],"name")&&(f=f.replace(/<%= name %>/g,this[a].name)),fs.outputFile(d,f)}}}.bind(this)).on("end",function(){var c=setTimeout(function(){clearTimeout(c),this.spinner.stop(!0),this.info(["Files was properly generated for your",a,"application."].join(" ")),b()}.bind(this),this.cfg.delay)}.bind(this))}else b()}.bind(this),function(){a()})}},install:{packages:function(){this.banner("We will install needed packages"),_.each(["node","angular"],function(a){if(this.cfg.generate[a]){var b=this.dependencies[a].dependencies,c=this.dependencies[a].devDependencies,d="node"===a?"npmInstall":"bowerInstall";_.isEmpty(b)||this[d](b,{save:!0},function(){this.info(["Install",a,"dependencies succeed."].join(" "))}.bind(this)),_.isEmpty(c)||this[d](c,{saveDev:!0},function(){this.info(["Install",a,"dev dependencies succeed."].join(" "))}.bind(this)),_.has(this.dependencies[a],"node")&&(_.isEmpty(this.dependencies[a].node.devDependencies)||this.npmInstall(this.dependencies[a].node.devDependencies,{saveDev:!0},function(){this.info(["Install",a,"extra node dev dependencies succeed."].join(" "))}.bind(this)),_.isEmpty(this.dependencies[a].node.dependencies)||this.npmInstall(this.dependencies[a].node.dependencies,{save:!0},function(){this.info(["Install",a,"extra node dependencies succeed."].join(" "))}.bind(this)))}}.bind(this))}},end:{processGrunt:function(){this.banner("We will process grunt task before ending."),this.spawnCommand("grunt")}}});