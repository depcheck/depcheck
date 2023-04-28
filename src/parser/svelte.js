import { parse } from '@babel/parser';
import { getContent } from '../utils/file';

export default async function parseSvelte(filename) {
  const { preprocess } = await import('svelte/compiler');
  const content = await getContent(filename);

  let script = 'import "svelte";\n';
  await preprocess(content, [
    {
      script: (svelteScript) => {
        script += svelteScript.content;
      },
    },
  ]);

  return parse(script, {
    sourceType: 'module',
    // Enable all known compatible @babel/parser plugins at the time of writing.
    // Because we only parse them, not evaluate any code, it is safe to do so.
    // note that babel/parser 7+ does not support *, due to plugin incompatibilities
    plugins: [
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
    ],
  });
}
