var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import React from 'react';
import classnames from 'classnames';
//
export default {
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

    return React.createElement(
      'div',
      _extends({ className: classnames(compClass, className) }, rest),
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

  return typeof Comp === 'function' ? React.createElement(Comp, params) : fallback;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsImNsYXNzbmFtZXMiLCJnZXQiLCJzZXQiLCJ0YWtlUmlnaHQiLCJsYXN0Iiwib3JkZXJCeSIsInJhbmdlIiwicmVtb3ZlIiwiY2xvbmUiLCJsZWF2ZXMiLCJpdGVyVHJlZSIsImdldEZpcnN0RGVmaW5lZCIsInN1bSIsIm1ha2VUZW1wbGF0ZUNvbXBvbmVudCIsImdyb3VwQnkiLCJpc0FycmF5Iiwic3BsaXRQcm9wcyIsImNvbXBhY3RPYmplY3QiLCJpc1NvcnRpbmdEZXNjIiwibm9ybWFsaXplQ29tcG9uZW50IiwiYXNQeCIsIm9iaiIsInBhdGgiLCJkZWYiLCJwYXRoT2JqIiwibWFrZVBhdGhBcnJheSIsInZhbCIsInJlZHVjZSIsImN1cnJlbnQiLCJwYXRoUGFydCIsImUiLCJ2YWx1ZSIsImtleXMiLCJrZXlQYXJ0IiwiY3Vyc29yIiwic2hpZnQiLCJsZW5ndGgiLCJhcnIiLCJuIiwic3RhcnQiLCJzbGljZSIsImkiLCJwdXNoIiwiZnVuY3MiLCJkaXJzIiwiaW5kZXhLZXkiLCJzb3J0Iiwicm93QSIsInJvd0IiLCJjb21wIiwiZGVzYyIsInNvcnRJbnQiLCJhIiwiYiIsImZpbHRlciIsIm8iLCJyIiwic3BsaWNlIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5Iiwia2V5IiwidG9TdHJpbmciLCJyb290IiwiY2hpbGRQcm9wZXJ0eSIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImNoaWxkcmVuIiwibWFwIiwiY2hpbGQiLCJjb25jYXQiLCJjb21wQ2xhc3MiLCJkaXNwbGF5TmFtZSIsIkVycm9yIiwiY21wIiwiY2xhc3NOYW1lIiwicmVzdCIsInhzIiwicnYiLCJ4IiwicmVzS2V5IiwiTnVtYmVyIiwiaXNOYU4iLCJBcnJheSIsImZsYXR0ZW5EZWVwIiwiam9pbiIsInJlcGxhY2UiLCJzcGxpdCIsIm5ld0FyciIsInN0eWxlIiwibmV3T2JqIiwidW5k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SSxHQUF4QixFQUE2QjtBQUMzQixNQUFNdUUsU0FBUyxFQUFmO0FBQ0EsTUFBSXZFLEdBQUosRUFBUztBQUNQNEMsV0FBT2pDLElBQVAsQ0FBWVgsR0FBWixFQUFpQmlELEdBQWpCLENBQXFCLGVBQU87QUFDMUIsVUFDRUwsT0FBT0MsU0FBUCxDQUFpQkMsY0FBakIsQ0FBZ0NDLElBQWhDLENBQXFDL0MsR0FBckMsRUFBMEN3QyxHQUExQyxLQUNBeEMsSUFBSXdDLEdBQUosTUFBYWdDLFNBRGIsSUFFQSxPQUFPeEUsSUFBSXdDLEdBQUosQ0FBUCxLQUFvQixXQUh0QixFQUlFO0FBQ0ErQixlQUFPL0IsR0FBUCxJQUFjeEMsSUFBSXdDLEdBQUosQ0FBZDtBQUNEO0FBQ0QsYUFBTyxJQUFQO0FBQ0QsS0FURDtBQVVEO0FBQ0QsU0FBTytCLE1BQVA7QUFDRDs7QUFFRCxTQUFTMUUsYUFBVCxDQUF3QjRFLENBQXhCLEVBQTJCO0FBQ3pCLFNBQU8sQ0FBQyxFQUFFQSxFQUFFaEQsSUFBRixLQUFXLE1BQVgsSUFBcUJnRCxFQUFFNUMsSUFBRixLQUFXLElBQWhDLElBQXdDNEMsRUFBRUMsR0FBRixLQUFVLEtBQXBELENBQVI7QUFDRDs7QUFFRCxTQUFTNUUsa0JBQVQsQ0FBNkI2RSxJQUE3QixFQUFpRTtBQUFBLE1BQTlCQyxNQUE4Qix1RUFBckIsRUFBcUI7QUFBQSxNQUFqQkMsUUFBaUIsdUVBQU5GLElBQU07O0FBQy9ELFNBQU8sT0FBT0EsSUFBUCxLQUFnQixVQUFoQixHQUNMLG9CQUFDLElBQUQsRUFBVUMsTUFBVixDQURLLEdBR0xDLFFBSEY7QUFLRCIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnXG4vL1xuZXhwb3J0IGRlZmF1bHQge1xuICBnZXQsXG4gIHNldCxcbiAgdGFrZVJpZ2h0LFxuICBsYXN0LFxuICBvcmRlckJ5LFxuICByYW5nZSxcbiAgcmVtb3ZlLFxuICBjbG9uZSxcbiAgbGVhdmVzLFxuICBpdGVyVHJlZSxcbiAgZ2V0Rmlyc3REZWZpbmVkLFxuICBzdW0sXG4gIG1ha2VUZW1wbGF0ZUNvbXBvbmVudCxcbiAgZ3JvdXBCeSxcbiAgaXNBcnJheSxcbiAgc3BsaXRQcm9wcyxcbiAgY29tcGFjdE9iamVjdCxcbiAgaXNTb3J0aW5nRGVzYyxcbiAgbm9ybWFsaXplQ29tcG9uZW50LFxuICBhc1B4LFxufVxuXG5mdW5jdGlvbiBnZXQgKG9iaiwgcGF0aCwgZGVmKSB7XG4gIGlmICghcGF0aCkge1xuICAgIHJldHVybiBvYmpcbiAgfVxuICBjb25zdCBwYXRoT2JqID0gbWFrZVBhdGhBcnJheShwYXRoKVxuICBsZXQgdmFsXG4gIHRyeSB7XG4gICAgdmFsID0gcGF0aE9iai5yZWR1Y2UoKGN1cnJlbnQsIHBhdGhQYXJ0KSA9PiBjdXJyZW50W3BhdGhQYXJ0XSwgb2JqKVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gY29udGludWUgcmVnYXJkbGVzcyBvZiBlcnJvclxuICB9XG4gIHJldHVybiB0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJyA/IHZhbCA6IGRlZlxufVxuXG5mdW5jdGlvbiBzZXQgKG9iaiA9IHt9LCBwYXRoLCB2YWx1ZSkge1xuICBjb25zdCBrZXlzID0gbWFrZVBhdGhBcnJheShwYXRoKVxuICBsZXQga2V5UGFydFxuICBsZXQgY3Vyc29yID0gb2JqXG4gIHdoaWxlICgoa2V5UGFydCA9IGtleXMuc2hpZnQoKSkgJiYga2V5cy5sZW5ndGgpIHtcbiAgICBpZiAoIWN1cnNvcltrZXlQYXJ0XSkge1xuICAgICAgY3Vyc29yW2tleVBhcnRdID0ge31cbiAgICB9XG4gICAgY3Vyc29yID0gY3Vyc29yW2tleVBhcnRdXG4gIH1cbiAgY3Vyc29yW2tleVBhcnRdID0gdmFsdWVcbiAgcmV0dXJuIG9ialxufVxuXG5mdW5jdGlvbiB0YWtlUmlnaHQgKGFyciwgbikge1xuICBjb25zdCBzdGFydCA9IG4gPiBhcnIubGVuZ3RoID8gMCA6IGFyci5sZW5ndGggLSBuXG4gIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQpXG59XG5cbmZ1bmN0aW9uIGxhc3QgKGFycikge1xuICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXVxufVxuXG5mdW5jdGlvbiByYW5nZSAobikge1xuICBjb25zdCBhcnIgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkgKz0gMSkge1xuICAgIGFyci5wdXNoKG4pXG4gIH1cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiBvcmRlckJ5IChhcnIsIGZ1bmNzLCBkaXJzLCBpbmRleEtleSkge1xuICByZXR1cm4gYXJyLnNvcnQoKHJvd0EsIHJvd0IpID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1bmNzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBjb21wID0gZnVuY3NbaV1cbiAgICAgIGNvbnN0IGRlc2MgPSBkaXJzW2ldID09PSBmYWxzZSB8fCBkaXJzW2ldID09PSAnZGVzYydcbiAgICAgIGNvbnN0IHNvcnRJbnQgPSBjb21wKHJvd0EsIHJvd0IpXG4gICAgICBpZiAoc29ydEludCkge1xuICAgICAgICByZXR1cm4gZGVzYyA/IC1zb3J0SW50IDogc29ydEludFxuICAgICAgfVxuICAgIH1cbiAgICAvLyBVc2UgdGhlIHJvdyBpbmRleCBmb3IgdGllIGJyZWFrZXJzXG4gICAgcmV0dXJuIGRpcnNbMF0gPyByb3dBW2luZGV4S2V5XSAtIHJvd0JbaW5kZXhLZXldIDogcm93QltpbmRleEtleV0gLSByb3dBW2luZGV4S2V5XVxuICB9KVxufVxuXG5mdW5jdGlvbiByZW1vdmUgKGEsIGIpIHtcbiAgcmV0dXJuIGEuZmlsdGVyKChvLCBpKSA9PiB7XG4gICAgY29uc3QgciA9IGIobylcbiAgICBpZiAocikge1xuICAgICAgYS5zcGxpY2UoaSwgMSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9KVxufVxuXG5mdW5jdGlvbiBjbG9uZSAoYSkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoYSwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICB9KVxuICAgIClcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBhXG4gIH1cbn1cblxuZnVuY3Rpb24gbGVhdmVzIChyb290LCBjaGlsZFByb3BlcnR5KSB7XG4gIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocm9vdCwgY2hpbGRQcm9wZXJ0eSkpIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHJvb3RbY2hpbGRQcm9wZXJ0eV0ubWFwKGNoaWxkID0+IGxlYXZlcyhjaGlsZCwgY2hpbGRQcm9wZXJ0eSkpXG4gICAgcmV0dXJuIFtdLmNvbmNhdCguLi5jaGlsZHJlbilcbiAgfVxuXG4gIHJldHVybiBbcm9vdF1cbn1cblxuZnVuY3Rpb24gaXRlclRyZWUgKHJvb3QsIGNoaWxkUHJvcGVydHkpIHtcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyb290LCBjaGlsZFByb3BlcnR5KSkge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gcm9vdFtjaGlsZFByb3BlcnR5XS5tYXAoY2hpbGQgPT4gbGVhdmVzKGNoaWxkLCBjaGlsZFByb3BlcnR5KSlcbiAgICByZXR1cm4gW10uY29uY2F0KHJvb3QsIC4uLmNoaWxkcmVuKVxuICB9XG5cbiAgcmV0dXJuIFtyb290XVxufVxuXG5mdW5jdGlvbiBnZXRGaXJzdERlZmluZWQgKC4uLmFyZ3MpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHR5cGVvZiBhcmdzW2ldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGFyZ3NbaV1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3VtIChhcnIpIHtcbiAgcmV0dXJuIGFyci5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKVxufVxuXG5mdW5jdGlvbiBtYWtlVGVtcGxhdGVDb21wb25lbnQgKGNvbXBDbGFzcywgZGlzcGxheU5hbWUpIHtcbiAgaWYgKCFkaXNwbGF5TmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gZGlzcGxheU5hbWUgZm91bmQgZm9yIHRlbXBsYXRlIGNvbXBvbmVudDonLCBjb21wQ2xhc3MpXG4gIH1cbiAgY29uc3QgY21wID0gKHsgY2hpbGRyZW4sIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSA9PiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY29tcENsYXNzLCBjbGFzc05hbWUpfSB7Li4ucmVzdH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbiAgY21wLmRpc3BsYXlOYW1lID0gZGlzcGxheU5hbWVcbiAgcmV0dXJuIGNtcFxufVxuXG5mdW5jdGlvbiBncm91cEJ5ICh4cywga2V5KSB7XG4gIHJldHVybiB4cy5yZWR1Y2UoKHJ2LCB4LCBpKSA9PiB7XG4gICAgY29uc3QgcmVzS2V5ID0gdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJyA/IGtleSh4LCBpKSA6IHhba2V5XVxuICAgIHJ2W3Jlc0tleV0gPSBpc0FycmF5KHJ2W3Jlc0tleV0pID8gcnZbcmVzS2V5XSA6IFtdXG4gICAgcnZbcmVzS2V5XS5wdXNoKHgpXG4gICAgcmV0dXJuIHJ2XG4gIH0sIHt9KVxufVxuXG5mdW5jdGlvbiBhc1B4ICh2YWx1ZSkge1xuICB2YWx1ZSA9IE51bWJlcih2YWx1ZSlcbiAgcmV0dXJuIE51bWJlci5pc05hTih2YWx1ZSkgPyBudWxsIDogYCR7dmFsdWV9cHhgXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKGEpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSlcbn1cblxuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4vLyBOb24tZXhwb3J0ZWQgSGVscGVyc1xuLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbmZ1bmN0aW9uIG1ha2VQYXRoQXJyYXkgKG9iaikge1xuICByZXR1cm4gZmxhdHRlbkRlZXAob2JqKVxuICAgIC5qb2luKCcuJylcbiAgICAucmVwbGFjZSgvXFxbL2csICcuJylcbiAgICAucmVwbGFjZSgvXFxdL2csICcnKVxuICAgIC5zcGxpdCgnLicpXG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5EZWVwIChhcnIsIG5ld0FyciA9IFtdKSB7XG4gIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgbmV3QXJyLnB1c2goYXJyKVxuICB9IGVsc2Uge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBmbGF0dGVuRGVlcChhcnJbaV0sIG5ld0FycilcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ld0FyclxufVxuXG5mdW5jdGlvbiBzcGxpdFByb3BzICh7IGNsYXNzTmFtZSwgc3R5bGUsIC4uLnJlc3QgfSkge1xuICByZXR1cm4ge1xuICAgIGNsYXNzTmFtZSxcbiAgICBzdHlsZSxcbiAgICByZXN0OiByZXN0IHx8IHt9LFxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhY3RPYmplY3QgKG9iaikge1xuICBjb25zdCBuZXdPYmogPSB7fVxuICBpZiAob2JqKSB7XG4gICAgT2JqZWN0LmtleXMob2JqKS5tYXAoa2V5ID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSAmJlxuICAgICAgICBvYmpba2V5XSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIHR5cGVvZiBvYmpba2V5XSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICkge1xuICAgICAgICBuZXdPYmpba2V5XSA9IG9ialtrZXldXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIG5ld09ialxufVxuXG5mdW5jdGlvbiBpc1NvcnRpbmdEZXNjIChkKSB7XG4gIHJldHVybiAhIShkLnNvcnQgPT09ICdkZXNjJyB8fCBkLmRlc2MgPT09IHRydWUgfHwgZC5hc2MgPT09IGZhbHNlKVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVDb21wb25lbnQgKENvbXAsIHBhcmFtcyA9IHt9LCBmYWxsYmFjayA9IENvbXApIHtcbiAgcmV0dXJuIHR5cGVvZiBDb21wID09PSAnZnVuY3Rpb24nID8gKFxuICAgIDxDb21wIHsuLi5wYXJhbXN9IC8+XG4gICkgOiAoXG4gICAgZmFsbGJhY2tcbiAgKVxufVxuIl19