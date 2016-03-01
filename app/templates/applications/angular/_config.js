'use strict';

/**
 * Define local Staote provider configuration
 *
 * @param {Object} localStorageServiceProvider https://github.com/grevory/angular-local-storage
 */
angular.module('<%= name %>')
.config([ 'localStorageServiceProvider',
function (localStorageServiceProvider) {
  // set prefix
  localStorageServiceProvider.setPrefix('<%= name %>');
}]);

/**
 * Allow some ref to compile list. for sms / tel usage
 *
 * @param {Object} $compilteProvider https://docs.angularjs.org/api/ng/provider/$compileProvider
 */
angular.module('<%= name %>')
.config([ '$compileProvider', function ($compileProvider) {
  // add list
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|sms):/);
}]);

/**
 * Tricks For Ng Touch, Prevent the base click envent from ngTouch
 *
 * @param {Object} $provide https://docs.angularjs.org/api/auto/service/$provide
 * @param {Object} $delegate https://docs.angularjs.org/api/auto/service/$provide
 * @param {Object} $parse https://docs.angularjs.org/api/ng/service/$parse
 */
angular.module('<%= name %>')
.config([ '$provide', function ($provide) {
 // Create a decoration for ngClickDirective
 $provide.decorator('ngClickDirective', [ '$delegate', '$parse', function ($delegate, $parse) {
  // Get the original compile function by ngTouch
  var origValue = $delegate[0].compile();

  // Get set the compiler
  $delegate[0].compile = compiler;

  //return augmented ngClick
  return $delegate;

  // Compiler Implementation
  function compiler(elm, attr) {
    // Look for "notouch" attribute, if present return regular click event, 
    // no touch simulation
    if (angular.isDefined(attr.notouch)) {
      // get fn
      var fn = $parse(attr[ 'ngClick' ]);
      // default statement
      return function handler(scope, element) {
        // bind click event
        element.on('click', function (event) {
          // apply
          scope.$apply(function () {
            // call fn
            fn(scope, { $event:event });
          });
        });
      }
    }
    // return original ngCLick implementation by ngTouch
    return origValue;
   }
 }]);
}]);

/**
 * Define your default translate rules
 *
 * param {Object} $translateProvider https://angular-translate.github.io/docs/
 * param {Object} appConstantsProvider current application constants provider
 */
angular.module('<%= name %>')
.config([ '$translateProvider', 'appConstantsProvider',
function ($translateProvider, appConstantsProvider) {
  // load config
  $translateProvider.useLoader('translationsLoader');
  // set default language
  $translateProvider.preferredLanguage(appConstantsProvider.keys().translations.defaultLanguage ||
                                       'en_US');
  // use local storage
  $translateProvider.useLocalStorage();
  // enable cache language
  $translateProvider.useLoaderCache(true);
  // enable async refresh
  $translateProvider.forceAsyncReload(true);
  // enable security
  $translateProvider.useSanitizeValueStrategy('escape');
}]);

/**
 * Define rules for http request cross domain
 *
 * @param {Object} $httpProvider https://docs.angularjs.org/api/ng/provider/$httpProvider
 */
angular.module('<%= name %>')
.config([ '$httpProvider', function ($httpProvider) {
  // set default XDomain to true
  $httpProvider.defaults.useXDomain = true;
  // delete non needed header
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

/**
 * Set config for token
 *
 * @param {Object} jwtConstantProvider default provider to manage jwt config
 */
angular.module('<%= name %>')
.config([ 'jwtConstantProvider', function (jwtConstantProvider) {
  // set default token
  jwtConstantProvider.set({ refreshToken : 30000, refreshUrl : 'token/refresh', autoStart : true });
}]);