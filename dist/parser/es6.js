'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseES6;

var _babylon = require('babylon');

function parseES6(content) {
  return (0, _babylon.parse)(content, {
    sourceType: 'module'
  });
}
module.exports = exports['default'];