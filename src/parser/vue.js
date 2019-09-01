import { parse } from '@babel/parser';
import importFrom from 'import-from';
import { tryRequire } from '../utils';

const compiler = importFrom(process.cwd(), 'vue-template-compiler') || tryRequire('vue-template-compiler');

export default function parseVue(content) {
  if (!compiler) {
    return [];
  }
  const parsed = compiler.parseComponent(content);
  if (!parsed.script) {
    return [];
  }
  return parse(parsed.script.content, {
    sourceType: 'module',
  });
}
