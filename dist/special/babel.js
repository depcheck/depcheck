'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = parseBabel;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    return {}; // ignore parse error silently
  }
}

function isPlugin(target, plugin) {
  return _lodash2.default.isString(target) ? target === plugin || target === 'babel-plugin-' + plugin : target[0] === plugin || target[0] === 'babel-plugin-' + plugin;
}

function contain(array, dep, prefix) {
  if (!array) {
    return false;
  }

  // extract name if wrapping with options
  var names = array.map(function (item) {
    return _lodash2.default.isString(item) ? item : item[0];
  });
  if (names.indexOf(dep) !== -1) {
    return true;
  }

  if (prefix && dep.indexOf(prefix) === 0) {
    return contain(array, dep.substring(prefix.length), false);
  }

  return false;
}

function getReactTransforms(deps, plugins) {
  var transforms = (0, _lodash2.default)(plugins || []).filter(function (plugin) {
    return isPlugin(plugin, 'react-transform');
  }).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        plugin = _ref2[1];

    return plugin.transforms.map(function (_ref3) {
      var transform = _ref3.transform;
      return transform;
    });
  }).first();

  return _lodash2.default.intersection(transforms, deps);
}

function filter(deps, options) {
  var presets = deps.filter(function (dep) {
    return contain(options.presets, dep, 'babel-preset-');
  });

  var plugins = deps.filter(function (dep) {
    return contain(options.plugins, dep, 'babel-plugin-');
  });

  var reactTransforms = getReactTransforms(deps, options.plugins);

  return presets.concat(plugins, reactTransforms);
}

function checkOptions(deps) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var optDeps = filter(deps, options);
  var envDeps = (0, _lodash2.default)(options.env).values().map(function (env) {
    return filter(deps, env);
  }).flatten().value();

  return optDeps.concat(envDeps);
}

function parseBabel(content, filePath, deps) {
  var filename = _path2.default.basename(filePath);

  if (filename === '.babelrc') {
    var options = parse(content);
    return checkOptions(deps, options);
  }

  if (filename === 'package.json') {
    var metadata = parse(content);
    return checkOptions(deps, metadata.babel);
  }

  return [];
}
module.exports = exports['default'];