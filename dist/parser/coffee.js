'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseCoffeeScript;

var _depsRegex = require('deps-regex');

var _depsRegex2 = _interopRequireDefault(_depsRegex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var re = new _depsRegex2.default({ matchES6: false });

function parseCoffeeScript(content) {
  return re.getDependencies(content);
}
module.exports = exports['default'];