'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseTypescript;

var _babylon = require('babylon');

var _utils = require('../utils');

var typescript = (0, _utils.tryRequire)('typescript');

function parseTypescript(content, filePath) {
  if (!typescript) {
    return [];
  }

  var compileOptions = {
    module: typescript.ModuleKind.CommonJS,
    target: typescript.ScriptTarget.Latest
  };

  var result = typescript.transpile(content, compileOptions, filePath);

  // TODO avoid parse source file twice, use Typescript native traverser to find out dependencies.
  // Reference: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
  return (0, _babylon.parse)(result, {
    sourceType: 'module'
  });
}
module.exports = exports['default'];