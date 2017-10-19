'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = detectRequireCallExpression;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function detectRequireCallExpression(node) {
  return node.type === 'CallExpression' && node.callee && node.callee.type === 'MemberExpression' && node.callee.object && node.callee.object.name === 'require' && node.callee.property && node.callee.property.name === 'resolve' && node.arguments[0] && _lodash2.default.isString(node.arguments[0].value) ? [node.arguments[0].value] : [];
}
module.exports = exports['default'];