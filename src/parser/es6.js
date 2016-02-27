import { parse } from 'babylon';

export default function parseES6(content) {
  return parse(content, {
    sourceType: 'module',
  });
}
