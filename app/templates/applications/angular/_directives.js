/**
 * Default CheckList model directives. for multiple checkbox choice
 * @see https://docs.angularjs.org/api/ng/service/$parse
 * @see https://docs.angularjs.org/api/ng/service/$compile 
 * @param (Object), $parse, default parse from angular service
 * @param (Object), $compile, default angular compile service
 */
angular.module('<%= name %>')
.directive('checklistModel', [ '$parse', '$compile', function ($parse, $compile) {
  /**
   * Default contains check function
   * @param (Array), array of items
   * @param (Mixed) item to check
   * @return (Boolean) true is all is ok false otherwise
   */
  function contains(arr, item) {
    if (angular.isArray(arr)) {
      for (var i = 0; i < arr.length; i++) {
        if (angular.equals(arr[i], item)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Default add  function
   * @param (Array), array of items
   * @param (Mixed) item to ad
   * @return (Array) array with current item
   */
  function add(arr, item) {
    arr = angular.isArray(arr) ? arr : [];
    for (var i = 0; i < arr.length; i++) {
      if (angular.equals(arr[i], item)) {
        return arr;
      }
    }    
    arr.push(item);
    return arr;
  }  

  /**
   * Default remove  function
   * @param (Array), array of items
   * @param (Mixed) item to remove
   * @return (Array) array without current item
   */
  function remove(arr, item) {
    if (angular.isArray(arr)) {
      for (var i = 0; i < arr.length; i++) {
        if (angular.equals(arr[i], item)) {
          arr.splice(i, 1);
          break;
        }
      }
    }
    return arr;
  }

  /**
   * Tricks for multiple directives
   * @see : http://stackoverflow.com/a/19228302/1458162
   * @param (Object), current scope
   * @param (Object), current element
   * @param (Object), current attributes
   */
  function postLinkFn(scope, elem, attrs) {
    
    // compile with `ng-model` pointing to `checked`
    $compile(elem)(scope);

    // getter / setter for original model
    var getter = $parse(attrs.checklistModel);
    var setter = getter.assign;

    // value added to list
    var value = $parse(attrs.checklistValue)(scope.$parent);

    // watch UI checked change
    scope.$watch('checked', function (newValue, oldValue) {
      if (newValue === oldValue) { 
        return;
      } 
      var current = getter(scope.$parent);

      if (newValue === true) {
        setter(scope.$parent, add(current, value));
      } else {
        setter(scope.$parent, remove(current, value));
      }
    });

    // watch original model change
    scope.$parent.$watch(attrs.checklistModel, function (newArr, oldArr) {
      scope.checked = contains(newArr, value);
    }, true);
  }

  // default return directives
  return {
    restrict  : 'A',
    priority  : 1000,
    terminal  : true,
    scope     : true,
    compile   : function (tElement, tAttrs) {
      if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
        throw 'checklist-model should be applied to `input[type="checkbox"]`.';
      }

      if (!tAttrs.checklistValue) {
        throw 'You should provide `checklist-value`.';
      }

      // exclude recursion
      tElement.removeAttr('checklist-model');
      
      // local scope var storing individual checkbox model
      tElement.attr('ng-model', 'checked');

      return postLinkFn;
    }
  };
}]);

