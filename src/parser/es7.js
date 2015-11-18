import { parse } from 'babylon';

export default content =>
  parse(content, {
    sourceType: 'module',

    // Enable all possible babylon plugins.
    // Because we only parse them, not evaluate any code, it is safe to do so.
    plugins: ['*'],
  });
