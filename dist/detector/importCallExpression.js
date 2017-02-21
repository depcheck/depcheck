'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = importCallExpression;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function importCallExpression(node) {
  return node.type === 'CallExpression' && node.callee && (node.callee.type === 'Identifier' && node.callee.name === 'import' || node.callee.type === 'Import' || node.callee.type === 'MemberExpression' && node.callee.object && node.callee.object.name === 'System' && node.callee.property && node.callee.property.name === 'import') && node.arguments[0] && _lodash2.default.isString(node.arguments[0].value) ? [node.arguments[0].value] : [];
}
module.exports = exports['default'];