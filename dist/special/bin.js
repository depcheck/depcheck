'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = parseBinary;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var metadataCache = {};

function getCacheOrRequire(packagePath) {
  if (metadataCache[packagePath]) {
    return metadataCache[packagePath];
  }

  var metadata = (0, _utils.readJSON)(packagePath);
  metadataCache[packagePath] = metadata;
  return metadata;
}

function loadMetadata(dep, dir) {
  try {
    var packagePath = _path2.default.resolve(dir, 'node_modules', dep, 'package.json');
    return getCacheOrRequire(packagePath);
  } catch (error) {
    return {}; // ignore silently
  }
}

function getBinaryFeatures(dep, _ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];

  var binPath = _path2.default.join('node_modules', dep, value).replace(/\\/g, '/');

  var features = [key, '$(npm bin)/' + key, 'node_modules/.bin/' + key, './node_modules/.bin/' + key, binPath, './' + binPath];

  return features;
}

function isBinaryInUse(dep, scripts, dir) {
  var metadata = loadMetadata(dep, dir);
  var binaries = _lodash2.default.toPairs(metadata.bin || {});
  return binaries.some(function (bin) {
    return getBinaryFeatures(dep, bin).some(function (feature) {
      return scripts.some(function (script) {
        return _lodash2.default.includes(' ' + script + ' ', ' ' + feature + ' ');
      });
    });
  });
}

function parseBinary(content, filepath, deps, dir) {
  var scripts = (0, _utils.getScripts)(filepath, content);
  return deps.filter(function (dep) {
    return isBinaryInUse(dep, scripts, dir);
  });
}
module.exports = exports['default'];