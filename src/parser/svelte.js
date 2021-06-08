import { parse } from '@babel/parser';
import { getContent } from '../utils/file';

export default async function parseSvelte(filename) {
  const { compile } = await import('svelte/compiler');
  const content = await getContent(filename);
  const { js } = compile(content);
  return parse(js.code, {
    sourceType: 'module',
  });
}
