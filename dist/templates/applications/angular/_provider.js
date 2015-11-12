/* generator-yoctopus-test - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.1.0 */
"use strict";angular.module("<%= name %>").provider("appConstants",[function(){var a={loggingUrl:"",translations:{defaultLanguage:"en_US",localeUrl:"",resolveDelay:1e3,locales:[]}},b=function(b){angular.merge(a,b),a=Object.freeze(a)};return{set:b,keys:function(){return a},$get:["$http","$rootScope",function(c,d){return{keys:function(){return a},load:function(){c.get("/config",{cache:!0}).then(function(a){b(a.data),d.$emit("$configLoadSuccess",a.data)},function(a){d.$emit("$configLoadError",a)})}}}]}}]),angular.module("<%= name %>").provider("appTranslate",[function(){var a={langs:{}},b=function(b){angular.merge(a.langs,b),a=Object.freeze(a)};return{set:b,keys:function(){return a.langs},$get:["$http","appConstants","$rootScope","$q","logService",function(c,d,e,f,g){return{configure:b,keys:function(){return a.langs},load:function(a){var b=f.defer(),e=a||d.keys().translations.defaultLanguage,h=[d.keys().translations.localeUrl,e].join("/").replace("//","/");return _.isEmpty(h)||c.get(h,{cache:!0}).then(function(a){_.isEmpty(a.data)?g.warn(["Translations for key [",e,"] are empty"].join("")):(this.configure(_.set({},e,a.data)),b.resolve(a.data))}.bind(this),function(a){g.error(["Cannot load language for key [",e,"]"].join("")),b.reject(a)}),b.promise}}}]}}]);