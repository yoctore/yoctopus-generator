/* generator-yoctopus - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.3.0 */
"use strict";angular.module("<%= name %>").service("logService",["$log","appConstants","$http","_","$location",function(a,b,c,d,e){return{notify:function(a,f){var g=b.keys().loggingUrl;d.isUndefined(g)||!d.isString(g)||d.isEmpty(g)?this.log("Cannot notify. Remote logging url is not defined."):c.post(b.keys().loggingUrl,{message:[["[",e.path(),"]"].join(" "),a].join(" - "),type:f})},log:function(c){b.keys().debug&&a.log(c)},info:function(c){b.keys().debug&&a.info(c)},warn:function(c){this.notify(c,"warning"),b.keys().debug&&a.warn(c)},error:function(c){this.notify(c,"error"),b.keys().debug&&a.error(c)},debug:function(c){b.keys().debug&&a.debug(c)}}}]),angular.module("<%= name %>").service("httpResponse",["_","logService",function(a,b){return{isValid:function(c){if(200===c.status){var d=c.data;if(a.has(d,"status")&&a.has(d,"code")&&a.has(d,"message")&&"success"===d.status&&a.startsWith(d.code.toString(),"200"))return!0}return b.warn(["An error occured during http response validation for :",JSON.stringify(c.data)].join(" ")),!1},isError:function(a){return!this.isValid(a)}}}]),angular.module("<%= name %>").service("httpService",["$http","$q","appConstants","apiRouteFactory","logService","httpResponse","localStorageService","cryptoService",function(a,b,c,d,e,f,g,h){return{process:function(c,i,j){i=_.isObject(i)?i:{},j=_.isObject(j)?j:{};var k=b.defer(),l=d.get(c);if(l)if(_.set(j,"url",d.getUrl(c,i)),_.set(j,"method",l.type?l.type.toUpperCase():!1),_.isString(j.url)&&!_.isEmpty(j.url)&&_.contains(["GET","HEAD","POST","PUT","DELETE","JSONP","PATCH"],j.method)){l.api&&(j={url:"/api",method:"POST",data:{url:j.url,data:j.data,method:j.method}});var m=g.get("user");_.isNull(m)||(m=h.decrypt(m),_.has(m,"id")&&_.isString(m.id)&&!_.isEmpty(m.id)&&(j.headers={"x-origin-id":m.id})),a(j).then(function(a){f.isValid(a)?k.resolve(a.data.data):k.reject(a.data.code)},function(a){e.error(["An error occured during an http action with error :",JSON.stringify(a)].join(" ")),k.reject(a)})}else e.warn(["Cannot process request http config is invalid for config :",JSON.stringify(j)].join(" ")),k.reject();else e.warn(["Cannot get url for given key [",c,"]"].join(" ")),k.reject();return k.promise}}}]),angular.module("<%= name %>").service("userInformationsService",["localStorageService","httpService","$rootScope","$cookies","logService","moment","cryptoService",function(a,b,c,d,e,f,g){var h=function(){c.$broadcast("$userInformationsService.change",a.get("user"))};return{init:function(){b.process("getSession").then(function(a){a&&_.has(a,"id")&&(this.set(a),this.loadUserInfo())}.bind(this),function(a){e.error(["Cannot get session for current user :",JSON.stringify(a)].join(" "))})},clear:function(){return a.clearAll()},checkSessionExistence:function(){b.process("sessionIsActive").then(function(a){c.$broadcast(a.data.activity?"$session.valid":"$session.invalid")},function(a){e.error(["Cannot get session connectivity for current user :",JSON.stringify(a)].join(" ")),c.$broadcast("$session.invalid")})},loadUserInfo:function(){var a=this.get();this.isConnected()?b.process("getUserInfos",{id:a.id}).then(function(a){a&&(console.log("Log user info succeed. Please provide code on service.js ligne 348"),c.$broadcast("$session.valid"))}.bind(this),function(a){e.error(["Cannot load user information :",JSON.stringify(a)].join(" "))}):c.$broadcast("$session.invalid")},isConnected:function(){return!_.isNull(this.get())},get:function(){var b=a.get("user");return _.isNull(b)||(b=g.decrypt(b)),b},set:function(b){return a.set("user",g.encrypt(b))},listenAndBroadcast:function(){var a=["LocalStorageModule.notification.setitem","LocalStorageModule.notification.removeitem"];_.each(a,function(a){c.$on(a,h)})},getProfileType:function(){return this.isConnected()?_.get(this.get(),"profile"):!1}}}]),angular.module("<%= name %>").service("cryptoService",["CryptoJS","appConstants",function(a,b){return{encrypt:function(c){return a.AES.encrypt(JSON.stringify(c),b.keys().keys.shared).toString()},decrypt:function(c){var d=a.AES.decrypt(c,b.keys().keys.shared);return JSON.parse(d.toString(a.enc.Utf8))}}}]),angular.module("<%= name %>").service("toastService",["toastr",function(a){var b=function(b,c){c[b]=!0,a[b](!0,!0,{extraData:c})};return{toastCall:function(a){var b=a.success?"success":a.warning?"warning":a.info?"info":"error";this[b].call(this,a)},success:function(a){b("success",a)},error:function(a){b("error",a)},info:function(a){b("info",a)},warning:function(a){b("warning",a)}}}]);