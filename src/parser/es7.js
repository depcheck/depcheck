import { parse } from '@babel/parser';
import { getContent } from '../utils/file';

export function parseES7Content(content) {
  return parse(content, {
    sourceType: 'module',

    // Enable all known compatible @babel/parser plugins at the time of writing.
    // Because we only parse them, not evaluate any code, it is safe to do so.
    // note that babel/parser 7+ does not support *, due to plugin incompatibilities
    plugins: [
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
      'flow',
      'flowComments',
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
    ],
  });
}

export default async function parseES7(filename) {
  const content = await getContent(filename);
  return parseES7Content(content);
}
