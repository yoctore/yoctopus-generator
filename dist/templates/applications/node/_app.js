/* generator-yoctopus-test - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.1.0 */
"use strict";var logger=require("yocto-logger"),core=require("yocto-core-stack"),_=require("lodash");core.debug=!1,core.init().then(function(){core.start().then(function(){})["catch"](function(a){core.logger.error(["[ CoreWrapper.start ] -",a].join(" ")),process.exit(0)})})["catch"](function(a){core.logger.error(["[ CoreWrapper.init ] -",a].join(" ")),process.exit(0)});