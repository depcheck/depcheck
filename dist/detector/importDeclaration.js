'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = detectImportDeclaration;
function detectImportDeclaration(node) {
  return node.type === 'ImportDeclaration' && node.source && node.source.value ? [node.source.value] : [];
}
module.exports = exports['default'];