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
 * Configure the breadcrumb provider
 *
 * @param {Object} $breadcrumbProvider https://github.com/ncuillery/angular-breadcrumb/wiki
 */
angular.module('<%= name %>')
.config([ '$breadcrumbProvider',
function ($breadcrumbProvider) {
  // Breadcrumb options
  $breadcrumbProvider.setOptions({
    templateUrl: 'partials/template/breadcrumb'
  });
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
  // enable cache language
  $translateProvider.useLoaderCache(true);
  // enable async refresh
  $translateProvider.forceAsyncReload(true);
  //translated values will be processed again with AngularJS $compile.
  $translateProvider.usePostCompiling(true);
  // enable security
  $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
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