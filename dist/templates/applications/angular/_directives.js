/* generator-yoctopus - Utility tool to build an yoctopus stack based on NodeJs / AngularJs - V1.3.1 */
"use strict";angular.module("<%= name %>").directive("checklistModel",["$parse","$compile",function(a,b){function c(a,b){if(angular.isArray(a))for(var c=0;c<a.length;c++)if(angular.equals(a[c],b))return!0;return!1}function d(a,b){a=angular.isArray(a)?a:[];for(var c=0;c<a.length;c++)if(angular.equals(a[c],b))return a;return a.push(b),a}function e(a,b){if(angular.isArray(a))for(var c=0;c<a.length;c++)if(angular.equals(a[c],b)){a.splice(c,1);break}return a}function f(f,g,h){b(g)(f);var i=a(h.checklistModel),j=i.assign,k=a(h.checklistValue)(f.$parent);f.$watch("checked",function(a,b){if(a!==b){var c=i(f.$parent);a===!0?j(f.$parent,d(c,k)):j(f.$parent,e(c,k))}}),f.$parent.$watch(h.checklistModel,function(a,b){f.checked=c(a,k)},!0)}return{restrict:"A",priority:1e3,terminal:!0,scope:!0,compile:function(a,b){if("INPUT"!==a[0].tagName||!a.attr("type","checkbox"))throw'checklist-model should be applied to `input[type="checkbox"]`.';if(!b.checklistValue)throw"You should provide `checklist-value`.";return a.removeAttr("checklist-model"),a.attr("ng-model","checked"),f}}}]);