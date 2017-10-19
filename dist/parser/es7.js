'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseES7;

var _babylon = require('babylon');

function parseES7(content) {
  return (0, _babylon.parse)(content, {
    sourceType: 'module',

    // Enable all possible babylon plugins.
    // Because we only parse them, not evaluate any code, it is safe to do so.
    plugins: ['*']
  });
}
module.exports = exports['default'];