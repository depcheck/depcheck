import { parse } from '@babel/parser';

const defaultPlugins = [
  'estree',
  'asyncFunctions',
  'asyncGenerators',
  'classConstructorCall',
  'classProperties',
  'doExpressions',
  'exponentiationOperator',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'functionBind',
  'functionSent',
  'objectRestSpread',
  'trailingFunctionCommas',
  'dynamicImport',
  'numericSeparator',
  'optionalChaining',
  'importMeta',
  'classPrivateProperties',
  'bigInt',
  'optionalCatchBinding',
  'throwExpressions',
  'nullishCoalescingOperator',
  'logicalAssignment',
];

export default function parseES7(content, filename, deps, dir, parserOpts) {
  // Enable all possible babylon plugins by default.
  // Because we only parse them, not evaluate any code, it is safe to do so.
  let plugins = defaultPlugins;
  if (parserOpts && parserOpts.es7 && parserOpts.es7.plugins) {
    ({ plugins } = parserOpts.es7);
  }
  return parse(content, {
    sourceType: 'module',
    plugins,
  });
}
