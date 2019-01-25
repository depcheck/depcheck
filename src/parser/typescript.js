import { parse } from '@babel/parser';
import { tryRequire } from '../utils';

const typescript = tryRequire('typescript');

export default function parseTypescript(content, filePath) {
  if (!typescript) {
    return [];
  }

  const defaultCompileOptions = {
    module: typescript.ModuleKind.CommonJS,
    target: typescript.ScriptTarget.Latest,
    jsx: typescript.JsxEmit.React,
  };

  const result = typescript.transpile(
    content,
    defaultCompileOptions,
    filePath,
  );

  // TODO avoid parse source file twice, use Typescript native traverser to find out dependencies.
  // Reference: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter
  // Enable all known compatible @babel/parser plugins at the time of writing.
  // Because we only parse them, not evaluate any code, it is safe to do so.
  // note that babel/parser 7+ does not support *, due to plugin incompatibilities
  return parse(result, {
    sourceType: 'module',
    plugins: [
      'asyncGenerators',
      'bigInt',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      { decorators: { decoratorsBeforeExport: true } },
      // not decorators-legacy
      'doExpressions',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'functionSent',
      'importMeta',
      'logicalAssignment',
      'nullishCoalescingOperator',
      'numericSeparator',
      'objectRestSpread',
      'optionalCatchBinding',
      'optionalChaining',
      { pipelineOperator: { proposal: 'minimal' } },
      'throwExpressions',
    ],
  });
}
