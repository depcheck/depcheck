import { parse } from 'babylon';

export default function parseJSX(content) {
  return parse(content, {
    sourceType: 'module',

    // Enable all possible babylon plugins.
    // Because the guys using React always want the newest syntax.
    plugins: ['*', 'jsx'],
  });
}
