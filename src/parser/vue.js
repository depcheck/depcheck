import { parse } from '@babel/parser';
import { tryRequire } from '../utils';

const compiler = tryRequire('vue-template-compiler');

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
