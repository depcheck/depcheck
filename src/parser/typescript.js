import { parse } from 'babylon';
import { tryRequire } from '../utils';

const typescript = tryRequire('typescript');

const defaultCompileOptions = {
  module: typescript.ModuleKind.CommonJS,
  target: typescript.ScriptTarget.Latest,
  jsx: typescript.JsxEmit.React,
};

export default function parseTypescript(content, filePath) {
  if (!typescript) {
    return [];
  }

  const result = typescript.transpile(
    content,
    defaultCompileOptions,
    filePath);

  // TODO avoid parse source file twice, use Typescript native traverser to find out dependencies.
  // Reference: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
  return parse(result, {
    sourceType: 'module',
  });
}
