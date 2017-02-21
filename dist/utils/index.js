'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getScripts = undefined;

var _getScripts = require('./get-scripts');

Object.defineProperty(exports, 'getScripts', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_getScripts).default;
  }
});
exports.readJSON = readJSON;
exports.evaluate = evaluate;
exports.tryRequire = tryRequire;

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readJSON(filePath) {
  return require(filePath); // eslint-disable-line global-require
}

function evaluate(code) {
  var exports = {};
  var sandbox = {
    exports: exports,
    module: { exports: exports }
  };

  _vm2.default.runInNewContext(code, sandbox);

  return sandbox.module.exports;
}

function tryRequire(module) {
  try {
    return require(module); // eslint-disable-line global-require
  } catch (e) {
    return null;
  }
}