import { getContent } from '../utils/file';
import { withFallback } from './fallback';

export default withFallback(async function parseES6(filename) {
  const { parse } = await import('@babel/parser');
  const content = await getContent(filename);

  return parse(content, {
    sourceType: 'module',
  });
});
