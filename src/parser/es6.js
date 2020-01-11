import { parse } from '@babel/parser';
import { getContent } from '../utils/file';

export default async function parseES6(filename) {
  const content = await getContent(filename);
  return parse(content, {
    sourceType: 'module',
  });
}
