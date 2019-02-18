'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//
exports.default = {
  get: get,
  set: set,
  takeRight: takeRight,
  last: last,
  orderBy: orderBy,
  range: range,
  remove: remove,
  clone: clone,
  leaves: leaves,
  iterTree: iterTree,
  getFirstDefined: getFirstDefined,
  sum: sum,
  makeTemplateComponent: makeTemplateComponent,
  groupBy: groupBy,
  isArray: isArray,
  splitProps: splitProps,
  compactObject: compactObject,
  isSortingDesc: isSortingDesc,
  normalizeComponent: normalizeComponent,
  asPx: asPx
};


function get(obj, path, def) {
  if (!path) {
    return obj;
  }
  var pathObj = makePathArray(path);
  var val = void 0;
  try {
    val = pathObj.reduce(function (current, pathPart) {
      return current[pathPart];
    }, obj);
  } catch (e) {
    // continue regardless of error
  }
  return typeof val !== 'undefined' ? val : def;
}

function set() {
  var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var path = arguments[1];
  var value = arguments[2];

  var keys = makePathArray(path);
  var keyPart = void 0;
  var cursor = obj;
  while ((keyPart = keys.shift()) && keys.length) {
    if (!cursor[keyPart]) {
      cursor[keyPart] = {};
    }
    cursor = cursor[keyPart];
  }
  cursor[keyPart] = value;
  return obj;
}

function takeRight(arr, n) {
  var start = n > arr.length ? 0 : arr.length - n;
  return arr.slice(start);
}

function last(arr) {
  return arr[arr.length - 1];
}

function range(n) {
  var arr = [];
  for (var i = 0; i < n; i += 1) {
    arr.push(n);
  }
  return arr;
}

function orderBy(arr, funcs, dirs, indexKey) {
  return arr.sort(function (rowA, rowB) {
    for (var i = 0; i < funcs.length; i += 1) {
      var comp = funcs[i];
      var desc = dirs[i] === false || dirs[i] === 'desc';
      var sortInt = comp(rowA, rowB);
      if (sortInt) {
        return desc ? -sortInt : sortInt;
      }
    }
    // Use the row index for tie breakers
    return dirs[0] ? rowA[indexKey] - rowB[indexKey] : rowB[indexKey] - rowA[indexKey];
  });
}

function remove(a, b) {
  return a.filter(function (o, i) {
    var r = b(o);
    if (r) {
      a.splice(i, 1);
      return true;
    }
    return false;
  });
}

function clone(a) {
  try {
    return JSON.parse(JSON.stringify(a, function (key, value) {
      if (typeof value === 'function') {
        return value.toString();
      }
      return value;
    }));
  } catch (e) {
    return a;
  }
}

function leaves(root, childProperty) {
  if (Object.prototype.hasOwnProperty.call(root, childProperty)) {
    var _ref;

    var children = root[childProperty].map(function (child) {
      return leaves(child, childProperty);
    });
    return (_ref = []).concat.apply(_ref, _toConsumableArray(children));
  }

  return [root];
}

function iterTree(root, childProperty) {
  if (Object.prototype.hasOwnProperty.call(root, childProperty)) {
    var _ref2;

    var children = root[childProperty].map(function (child) {
      return leaves(child, childProperty);
    });
    return (_ref2 = []).concat.apply(_ref2, [root].concat(_toConsumableArray(children)));
  }

  return [root];
}

function getFirstDefined() {
  for (var i = 0; i < arguments.length; i += 1) {
    if (typeof (arguments.length <= i ? undefined : arguments[i]) !== 'undefined') {
      return arguments.length <= i ? undefined : arguments[i];
    }
  }
}

function sum(arr) {
  return arr.reduce(function (a, b) {
    return a + b;
  }, 0);
}

function makeTemplateComponent(compClass, displayName) {
  if (!displayName) {
    throw new Error('No displayName found for template component:', compClass);
  }
  var cmp = function cmp(_ref3) {
    var children = _ref3.children,
        className = _ref3.className,
        rest = _objectWithoutProperties(_ref3, ['children', 'className']);

    return _react2.default.createElement(
      'div',
      _extends({ className: (0, _classnames2.default)(compClass, className) }, rest),
      children
    );
  };
  cmp.displayName = displayName;
  return cmp;
}

function groupBy(xs, key) {
  return xs.reduce(function (rv, x, i) {
    var resKey = typeof key === 'function' ? key(x, i) : x[key];
    rv[resKey] = isArray(rv[resKey]) ? rv[resKey] : [];
    rv[resKey].push(x);
    return rv;
  }, {});
}

function asPx(value) {
  value = Number(value);
  return Number.isNaN(value) ? null : value + 'px';
}

function isArray(a) {
  return Array.isArray(a);
}

// ########################################################################
// Non-exported Helpers
// ########################################################################

function makePathArray(obj) {
  return flattenDeep(obj).join('.').replace(/\[/g, '.').replace(/\]/g, '').split('.');
}

function flattenDeep(arr) {
  var newArr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (!isArray(arr)) {
    newArr.push(arr);
  } else {
    for (var i = 0; i < arr.length; i += 1) {
      flattenDeep(arr[i], newArr);
    }
  }
  return newArr;
}

function splitProps(_ref4) {
  var className = _ref4.className,
      style = _ref4.style,
      rest = _objectWithoutProperties(_ref4, ['className', 'style']);

  return {
    className: className,
    style: style,
    rest: rest || {}
  };
}

function compactObject(obj) {
  var newObj = {};
  if (obj) {
    Object.keys(obj).map(function (key) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined && typeof obj[key] !== 'undefined') {
        newObj[key] = obj[key];
      }
      return true;
    });
  }
  return newObj;
}

function isSortingDesc(d) {
  return !!(d.sort === 'desc' || d.desc === true || d.asc === false);
}

function normalizeComponent(Comp) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Comp;

  return typeof Comp === 'function' ? _react2.default.createElement(Comp, params) : fallback;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJnZXQiLCJzZXQiLCJ0YWtlUmlnaHQiLCJsYXN0Iiwib3JkZXJCeSIsInJhbmdlIiwicmVtb3ZlIiwiY2xvbmUiLCJsZWF2ZXMiLCJpdGVyVHJlZSIsImdldEZpcnN0RGVmaW5lZCIsInN1bSIsIm1ha2VUZW1wbGF0ZUNvbXBvbmVudCIsImdyb3VwQnkiLCJpc0FycmF5Iiwic3BsaXRQcm9wcyIsImNvbXBhY3RPYmplY3QiLCJpc1NvcnRpbmdEZXNjIiwibm9ybWFsaXplQ29tcG9uZW50IiwiYXNQeCIsIm9iaiIsInBhdGgiLCJkZWYiLCJwYXRoT2JqIiwibWFrZVBhdGhBcnJheSIsInZhbCIsInJlZHVjZSIsImN1cnJlbnQiLCJwYXRoUGFydCIsImUiLCJ2YWx1ZSIsImtleXMiLCJrZXlQYXJ0IiwiY3Vyc29yIiwic2hpZnQiLCJsZW5ndGgiLCJhcnIiLCJuIiwic3RhcnQiLCJzbGljZSIsImkiLCJwdXNoIiwiZnVuY3MiLCJkaXJzIiwiaW5kZXhLZXkiLCJzb3J0Iiwicm93QSIsInJvd0IiLCJjb21wIiwiZGVzYyIsInNvcnRJbnQiLCJhIiwiYiIsImZpbHRlciIsIm8iLCJyIiwic3BsaWNlIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5Iiwia2V5IiwidG9TdHJpbmciLCJyb290IiwiY2hpbGRQcm9wZXJ0eSIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImNoaWxkcmVuIiwibWFwIiwiY2hpbGQiLCJjb25jYXQiLCJjb21wQ2xhc3MiLCJkaXNwbGF5TmFtZSIsIkVycm9yIiwiY21wIiwiY2xhc3NOYW1lIiwicmVzdCIsInhzIiwicnYiLCJ4IiwicmVzS2V5IiwiTnVtYmVyIiwiaXNOYU4iLCJBcnJheSIsImZsYXR0ZW5EZWVwIiwiam9pbiIsInJlcGxhY2UiLCJzcGxpdCIsIm5ld0FyciIsInN0eWxlIiwibmV3T2JqIiwidW5kZWZpbmVkIiwiZCIsImFzYyIsIkNv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Q1A0QyxXQUFPakMsSUFBUCxDQUFZWCxHQUFaLEVBQWlCaUQsR0FBakIsQ0FBcUIsZUFBTztBQUMxQixVQUNFTCxPQUFPQyxTQUFQLENBQWlCQyxjQUFqQixDQUFnQ0MsSUFBaEMsQ0FBcUMvQyxHQUFyQyxFQUEwQ3dDLEdBQTFDLEtBQ0F4QyxJQUFJd0MsR0FBSixNQUFhZ0MsU0FEYixJQUVBLE9BQU94RSxJQUFJd0MsR0FBSixDQUFQLEtBQW9CLFdBSHRCLEVBSUU7QUFDQStCLGVBQU8vQixHQUFQLElBQWN4QyxJQUFJd0MsR0FBSixDQUFkO0FBQ0Q7QUFDRCxhQUFPLElBQVA7QUFDRCxLQVREO0FBVUQ7QUFDRCxTQUFPK0IsTUFBUDtBQUNEOztBQUVELFNBQVMxRSxhQUFULENBQXdCNEUsQ0FBeEIsRUFBMkI7QUFDekIsU0FBTyxDQUFDLEVBQUVBLEVBQUVoRCxJQUFGLEtBQVcsTUFBWCxJQUFxQmdELEVBQUU1QyxJQUFGLEtBQVcsSUFBaEMsSUFBd0M0QyxFQUFFQyxHQUFGLEtBQVUsS0FBcEQsQ0FBUjtBQUNEOztBQUVELFNBQVM1RSxrQkFBVCxDQUE2QjZFLElBQTdCLEVBQWlFO0FBQUEsTUFBOUJDLE1BQThCLHVFQUFyQixFQUFxQjtBQUFBLE1BQWpCQyxRQUFpQix1RUFBTkYsSUFBTTs7QUFDL0QsU0FBTyxPQUFPQSxJQUFQLEtBQWdCLFVBQWhCLEdBQ0wsOEJBQUMsSUFBRCxFQUFVQyxNQUFWLENBREssR0FHTEMsUUFIRjtBQUtEIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcydcbi8vXG5leHBvcnQgZGVmYXVsdCB7XG4gIGdldCxcbiAgc2V0LFxuICB0YWtlUmlnaHQsXG4gIGxhc3QsXG4gIG9yZGVyQnksXG4gIHJhbmdlLFxuICByZW1vdmUsXG4gIGNsb25lLFxuICBsZWF2ZXMsXG4gIGl0ZXJUcmVlLFxuICBnZXRGaXJzdERlZmluZWQsXG4gIHN1bSxcbiAgbWFrZVRlbXBsYXRlQ29tcG9uZW50LFxuICBncm91cEJ5LFxuICBpc0FycmF5LFxuICBzcGxpdFByb3BzLFxuICBjb21wYWN0T2JqZWN0LFxuICBpc1NvcnRpbmdEZXNjLFxuICBub3JtYWxpemVDb21wb25lbnQsXG4gIGFzUHgsXG59XG5cbmZ1bmN0aW9uIGdldCAob2JqLCBwYXRoLCBkZWYpIHtcbiAgaWYgKCFwYXRoKSB7XG4gICAgcmV0dXJuIG9ialxuICB9XG4gIGNvbnN0IHBhdGhPYmogPSBtYWtlUGF0aEFycmF5KHBhdGgpXG4gIGxldCB2YWxcbiAgdHJ5IHtcbiAgICB2YWwgPSBwYXRoT2JqLnJlZHVjZSgoY3VycmVudCwgcGF0aFBhcnQpID0+IGN1cnJlbnRbcGF0aFBhcnRdLCBvYmopXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBjb250aW51ZSByZWdhcmRsZXNzIG9mIGVycm9yXG4gIH1cbiAgcmV0dXJuIHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnID8gdmFsIDogZGVmXG59XG5cbmZ1bmN0aW9uIHNldCAob2JqID0ge30sIHBhdGgsIHZhbHVlKSB7XG4gIGNvbnN0IGtleXMgPSBtYWtlUGF0aEFycmF5KHBhdGgpXG4gIGxldCBrZXlQYXJ0XG4gIGxldCBjdXJzb3IgPSBvYmpcbiAgd2hpbGUgKChrZXlQYXJ0ID0ga2V5cy5zaGlmdCgpKSAmJiBrZXlzLmxlbmd0aCkge1xuICAgIGlmICghY3Vyc29yW2tleVBhcnRdKSB7XG4gICAgICBjdXJzb3Jba2V5UGFydF0gPSB7fVxuICAgIH1cbiAgICBjdXJzb3IgPSBjdXJzb3Jba2V5UGFydF1cbiAgfVxuICBjdXJzb3Jba2V5UGFydF0gPSB2YWx1ZVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIHRha2VSaWdodCAoYXJyLCBuKSB7XG4gIGNvbnN0IHN0YXJ0ID0gbiA+IGFyci5sZW5ndGggPyAwIDogYXJyLmxlbmd0aCAtIG5cbiAgcmV0dXJuIGFyci5zbGljZShzdGFydClcbn1cblxuZnVuY3Rpb24gbGFzdCAoYXJyKSB7XG4gIHJldHVybiBhcnJbYXJyLmxlbmd0aCAtIDFdXG59XG5cbmZ1bmN0aW9uIHJhbmdlIChuKSB7XG4gIGNvbnN0IGFyciA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSArPSAxKSB7XG4gICAgYXJyLnB1c2gobilcbiAgfVxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIG9yZGVyQnkgKGFyciwgZnVuY3MsIGRpcnMsIGluZGV4S2V5KSB7XG4gIHJldHVybiBhcnIuc29ydCgocm93QSwgcm93QikgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnVuY3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGNvbXAgPSBmdW5jc1tpXVxuICAgICAgY29uc3QgZGVzYyA9IGRpcnNbaV0gPT09IGZhbHNlIHx8IGRpcnNbaV0gPT09ICdkZXNjJ1xuICAgICAgY29uc3Qgc29ydEludCA9IGNvbXAocm93QSwgcm93QilcbiAgICAgIGlmIChzb3J0SW50KSB7XG4gICAgICAgIHJldHVybiBkZXNjID8gLXNvcnRJbnQgOiBzb3J0SW50XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFVzZSB0aGUgcm93IGluZGV4IGZvciB0aWUgYnJlYWtlcnNcbiAgICByZXR1cm4gZGlyc1swXSA/IHJvd0FbaW5kZXhLZXldIC0gcm93QltpbmRleEtleV0gOiByb3dCW2luZGV4S2V5XSAtIHJvd0FbaW5kZXhLZXldXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoYSwgYikge1xuICByZXR1cm4gYS5maWx0ZXIoKG8sIGkpID0+IHtcbiAgICBjb25zdCByID0gYihvKVxuICAgIGlmIChyKSB7XG4gICAgICBhLnNwbGljZShpLCAxKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGNsb25lIChhKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoXG4gICAgICBKU09OLnN0cmluZ2lmeShhLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIH0pXG4gICAgKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGFcbiAgfVxufVxuXG5mdW5jdGlvbiBsZWF2ZXMgKHJvb3QsIGNoaWxkUHJvcGVydHkpIHtcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyb290LCBjaGlsZFByb3BlcnR5KSkge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gcm9vdFtjaGlsZFByb3BlcnR5XS5tYXAoY2hpbGQgPT4gbGVhdmVzKGNoaWxkLCBjaGlsZFByb3BlcnR5KSlcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLmNoaWxkcmVuKVxuICB9XG5cbiAgcmV0dXJuIFtyb290XVxufVxuXG5mdW5jdGlvbiBpdGVyVHJlZSAocm9vdCwgY2hpbGRQcm9wZXJ0eSkge1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJvb3QsIGNoaWxkUHJvcGVydHkpKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSByb290W2NoaWxkUHJvcGVydHldLm1hcChjaGlsZCA9PiBsZWF2ZXMoY2hpbGQsIGNoaWxkUHJvcGVydHkpKVxuICAgIHJldHVybiBbXS5jb25jYXQocm9vdCwgLi4uY2hpbGRyZW4pXG4gIH1cblxuICByZXR1cm4gW3Jvb3RdXG59XG5cbmZ1bmN0aW9uIGdldEZpcnN0RGVmaW5lZCAoLi4uYXJncykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3NbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gYXJnc1tpXVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzdW0gKGFycikge1xuICByZXR1cm4gYXJyLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApXG59XG5cbmZ1bmN0aW9uIG1ha2VUZW1wbGF0ZUNvbXBvbmVudCAoY29tcENsYXNzLCBkaXNwbGF5TmFtZSkge1xuICBpZiAoIWRpc3BsYXlOYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBkaXNwbGF5TmFtZSBmb3VuZCBmb3IgdGVtcGxhdGUgY29tcG9uZW50OicsIGNvbXBDbGFzcylcbiAgfVxuICBjb25zdCBjbXAgPSAoeyBjaGlsZHJlbiwgY2xhc3NOYW1lLCAuLi5yZXN0IH0pID0+IChcbiAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjb21wQ2xhc3MsIGNsYXNzTmFtZSl9IHsuLi5yZXN0fT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxuICBjbXAuZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZVxuICByZXR1cm4gY21wXG59XG5cbmZ1bmN0aW9uIGdyb3VwQnkgKHhzLCBrZXkpIHtcbiAgcmV0dXJuIHhzLnJlZHVjZSgocnYsIHgsIGkpID0+IHtcbiAgICBjb25zdCByZXNLZXkgPSB0eXBlb2Yga2V5ID09PSAnZnVuY3Rpb24nID8ga2V5KHgsIGkpIDogeFtrZXldXG4gICAgcnZbcmVzS2V5XSA9IGlzQXJyYXkocnZbcmVzS2V5XSkgPyBydltyZXNLZXldIDogW11cbiAgICBydltyZXNLZXldLnB1c2goeClcbiAgICByZXR1cm4gcnZcbiAgfSwge30pXG59XG5cbmZ1bmN0aW9uIGFzUHggKHZhbHVlKSB7XG4gIHZhbHVlID0gTnVtYmVyKHZhbHVlKVxuICByZXR1cm4gTnVtYmVyLmlzTmFOKHZhbHVlKSA/IG51bGwgOiBgJHt2YWx1ZX1weGBcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoYSkge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhKVxufVxuXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbi8vIE5vbi1leHBvcnRlZCBIZWxwZXJzXG4vLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuZnVuY3Rpb24gbWFrZVBhdGhBcnJheSAob2JqKSB7XG4gIHJldHVybiBmbGF0dGVuRGVlcChvYmopXG4gICAgLmpvaW4oJy4nKVxuICAgIC5yZXBsYWNlKC9cXFsvZywgJy4nKVxuICAgIC5yZXBsYWNlKC9cXF0vZywgJycpXG4gICAgLnNwbGl0KCcuJylcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkRlZXAgKGFyciwgbmV3QXJyID0gW10pIHtcbiAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICBuZXdBcnIucHVzaChhcnIpXG4gIH0gZWxzZSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGZsYXR0ZW5EZWVwKGFycltpXSwgbmV3QXJyKVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3QXJyXG59XG5cbmZ1bmN0aW9uIHNwbGl0UHJvcHMgKHsgY2xhc3NOYW1lLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lLFxuICAgIHN0eWxlLFxuICAgIHJlc3Q6IHJlc3QgfHwge30sXG4gIH1cbn1cblxuZnVuY3Rpb24gY29tcGFjdE9iamVjdCAob2JqKSB7XG4gIGNvbnN0IG5ld09iaiA9IHt9XG4gIGlmIChvYmopIHtcbiAgICBPYmplY3Qua2V5cyhvYmopLm1hcChrZXkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpICYmXG4gICAgICAgIG9ialtrZXldICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgdHlwZW9mIG9ialtrZXldICE9PSAndW5kZWZpbmVkJ1xuICAgICAgKSB7XG4gICAgICAgIG5ld09ialtrZXldID0gb2JqW2tleV1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgfVxuICByZXR1cm4gbmV3T2JqXG59XG5cbmZ1bmN0aW9uIGlzU29ydGluZ0Rlc2MgKGQpIHtcbiAgcmV0dXJuICEhKGQuc29ydCA9PT0gJ2Rlc2MnIHx8IGQuZGVzYyA9PT0gdHJ1ZSB8fCBkLmFzYyA9PT0gZmFsc2UpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNvbXBvbmVudCAoQ29tcCwgcGFyYW1zID0ge30sIGZhbGxiYWNrID0gQ29tcCkge1xuICByZXR1cm4gdHlwZW9mIENvbXAgPT09ICdmdW5jdGlvbicgPyAoXG4gICAgPENvbXAgey4uLnBhcmFtc30gLz5cbiAgKSA6IChcbiAgICBmYWxsYmFja1xuICApXG59XG4iXX0=