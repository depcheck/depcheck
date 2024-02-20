import { withFallback } from './fallback';
import { getContent } from '../utils/file';

export default withFallback(async function parseSvelte(filename) {
  const { parse } = await import('@babel/parser');
  const { compile } = await import('svelte/compiler');

  const content = await getContent(filename);
  const { js } = compile(content);
  return parse(js.code, {
    sourceType: 'module',
  });
});
