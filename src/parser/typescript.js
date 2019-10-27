import { parse } from '@babel/parser';

export default function parseTypescript(content) {
  // Enable all known compatible @babel/parser plugins at the time of writing.
  // Because we only parse them, not evaluate any code, it is safe to do so.
  // note that babel/parser 7+ does not support *, due to plugin incompatibilities
  return parse(content, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
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
