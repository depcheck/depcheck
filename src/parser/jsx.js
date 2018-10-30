import { parse } from '@babel/parser';

export default function parseJSX(content, filename, deps, dir, parserOpts) {
  // Enable all possible babylon plugins by default.
  // Because the guys using React always want the newest syntax.
  let plugins = ['*', 'jsx'];
  if (parserOpts && parserOpts.jsx && parserOpts.jsx.plugins) {
    plugins = parserOpts.jsx.plugins;
  }
  return parse(content, {
    sourceType: 'module',
    plugins,
  });
}
