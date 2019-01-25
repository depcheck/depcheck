import { parse } from '@babel/parser';

export default function parseES6(content) {
  return parse(content, {
    sourceType: 'module',
  });
}
