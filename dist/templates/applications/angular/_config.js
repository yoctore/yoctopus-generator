/* generator-yoctopus - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.3.0 */
"use strict";angular.module("<%= name %>").config(["localStorageServiceProvider",function(a){a.setPrefix("<%= name %>")}]),angular.module("<%= name %>").config(["$compileProvider",function(a){a.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|sms):/)}]),angular.module("<%= name %>").config(["$provide",function(a){a.decorator("ngClickDirective",["$delegate","$parse",function(a,b){function c(a,c){if(angular.isDefined(c.notouch)){var e=b(c.ngClick);return function(a,b){b.on("click",function(b){a.$apply(function(){e(a,{$event:b})})})}}return d}var d=a[0].compile();return a[0].compile=c,a}])}]),angular.module("<%= name %>").config(["$translateProvider","appConstantsProvider",function(a,b){a.useLoader("translationsLoader"),a.preferredLanguage(b.keys().translations.defaultLanguage||"en_US"),a.useLocalStorage(),a.useLoaderCache(!0),a.forceAsyncReload(!0),a.useSanitizeValueStrategy("escape")}]),angular.module("<%= name %>").config(["$httpProvider",function(a){a.defaults.useXDomain=!0,delete a.defaults.headers.common["X-Requested-With"]}]),angular.module("<%= name %>").config(["jwtConstantProvider",function(a){a.set({refreshToken:3e4,refreshUrl:"token/refresh",autoStart:!0})}]);