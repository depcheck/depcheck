import { basename } from 'path';
import { getContent } from '../utils/file';

const tsconfigPattern = /tsconfig(?:\.[^.]+)*\.json/;
export default async function parseTslib(filename) {
  const name = basename(filename);
  if (!tsconfigPattern.test(name)) return [];
  const json = await getContent(filename);
  try {
    const tsconfig = JSON.parse(json);
    if (!tsconfig?.compilerOptions?.importHelpers) return [];
  } catch (e) {
    return [];
  }
  return ['tslib'];
}
