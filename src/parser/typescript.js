import { parse } from '@babel/parser';
import { getContent } from '../utils/file';

// Enable all known compatible @babel/parser plugins at the time of writing.
// Because we only parse them, not evaluate any code, it is safe to do so.
// note that babel/parser 7+ does not support *, due to plugin incompatibilities
const babelPlugins = [
  'typescript',
  'asyncGenerators',
  'bigInt',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  // ['decorators', { decoratorsBeforeExport: true }],
  'decorators-legacy',
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
  ['pipelineOperator', { proposal: 'minimal' }],
  'throwExpressions',
  'importAssertions',
  'explicitResourceManagement',
];

export default async function parseTypescript(filename) {
  const content = await getContent(filename);
  return parse(content, {
    sourceType: 'module',
    // Only if it's .tsx, we add the jsx plugin as it can cause issues with some regular .ts files
    plugins: filename.endsWith('.tsx')
      ? [...babelPlugins, 'jsx']
      : babelPlugins,
  });
}
