import { parse } from '@babel/parser';
import { getContent } from '../utils/file';
import fastParser from './fast';

export default async function parseES6(filename) {
  // return fastParser(filename);

  const content = await getContent(filename);
  return parse(content, {
    sourceType: 'module',
  });
}
