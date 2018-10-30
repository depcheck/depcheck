import { parse } from '@babel/parser';

const defaultPlugins = [
  'jsx',
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

export default function parseJSX(content, filename, deps, dir, parserOpts) {
  // Enable all possible babylon plugins by default.
  // Because the guys using React always want the newest syntax.
  let plugins = defaultPlugins;
  if (parserOpts && parserOpts.jsx && parserOpts.jsx.plugins) {
    ({ plugins } = parserOpts.jsx);
  }
  return parse(content, {
    sourceType: 'module',
    plugins,
  });
}
