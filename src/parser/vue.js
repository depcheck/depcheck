import { parse } from '@babel/parser';
import { parse as vueParse } from '@vue/compiler-sfc';
import { getContent } from '../utils/file';

export default async function parseVue(filename) {
  const content = await getContent(filename);
  const parsed = vueParse(content);
  const parsedContent =
    parsed.descriptor.script?.content || parsed.descriptor.scriptSetup?.content;
  if (!parsedContent) {
    return [];
  }

  return parse(parsedContent, {
    sourceType: 'module',

    // Enable all known compatible @babel/parser plugins at the time of writing.
    // Because we only parse them, not evaluate any code, it is safe to do so.
    // note that babel/parser 7+ does not support *, due to plugin incompatibilities
    // Because the guys using React always want the newest syntax.
    plugins: [
      'typescript',
      'asyncGenerators',
      'bigInt',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      // ['decorators', { decoratorsBeforeExport: true }],
      'decorators-legacy', // Vue cannot support both decorators
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
      // and finally, jsx
      'jsx',
    ],
  });
}
