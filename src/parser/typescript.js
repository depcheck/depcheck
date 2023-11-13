import { parse } from '@babel/parser';
import { getContent } from '../utils/file';

export default async function parseTypescript(filename) {
  const content = await getContent(filename);
  const plugins = [
      'typescript',
      'jsx',
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
  
  // Enable all known compatible @babel/parser plugins at the time of writing.
  // Because we only parse them, not evaluate any code, it is safe to do so.
  // note that babel/parser 7+ does not support *, due to plugin incompatibilities
  try {
    return await parse(content, {
      sourceType: 'module',
      plugins,
    });
  } catch (err) {
    if (err.code === 'BABEL_PARSER_SYNTAX_ERROR') {
      // re-run it without jsx, as this causes sometimes parsing errors
     return parse(content, {
          sourceType: 'module',
          plugins: plugins.filter(plugin => plugin !== 'jsx'),
     });
    }
    throw err;
  }
}
