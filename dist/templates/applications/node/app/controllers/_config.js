/* generator-yoctopus-test - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.1.0 */
"use strict";var path=require("path"),fs=require("fs");exports.base=function(a,b){var c={};try{var d=path.normalize([process.cwd(),"app/config/front.json"].join("/"));c=JSON.parse(fs.readFileSync(d))}catch(e){this.get("logger").error(["[ Config:endpoint:base ] -","An error occured during font configuration loading :",e.message].join(" "))}b.jsonp(c)},exports.languages=function(a,b){var c={};try{var d=path.normalize([process.cwd(),"app/config/languages",[a.params.isoCode,"json"].join(".")].join("/"));c=JSON.parse(fs.readFileSync(d))}catch(e){this.get("logger").error(["[ Config:endpoint:languages ] -","An error occured during language loading for [",a.params.isoCode,"] :",e.message].join(" "))}b.jsonp(c)};