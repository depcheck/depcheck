import { parse } from '@babel/parser';

export default function parseES6(content, filename, deps, dir, parserOpts) {
  let plugins = undefined;
  if (parserOpts && parserOpts.es6 && parserOpts.es6.plugins) {
    plugins = parserOpts.es6.plugins;
  }
  return parse(content, {
    sourceType: 'module',
    plugins,
  });
}
