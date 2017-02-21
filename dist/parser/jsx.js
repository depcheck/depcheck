'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseJSX;

var _babylon = require('babylon');

function parseJSX(content) {
  return (0, _babylon.parse)(content, {
    sourceType: 'module',

    // Enable all possible babylon plugins.
    // Because the guys using React always want the newest syntax.
    plugins: ['*', 'jsx']
  });
}
module.exports = exports['default'];