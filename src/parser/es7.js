import { parse } from '@babel/parser';

export default function parseES7(content, filename, deps, dir, parserOpts) {
  // Enable all possible babylon plugins by default.
  // Because we only parse them, not evaluate any code, it is safe to do so.
  let plugins = ['*'];
  if (parserOpts && parserOpts.es7 && parserOpts.es7.plugins) {
    plugins = parserOpts.es7.plugins;
  }
  return parse(content, {
    sourceType: 'module',
    plugins,
  });
}
