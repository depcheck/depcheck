import { parse } from 'babylon';
import { config } from './es6';

export default content =>
  parse(content, {
    ...config,
    plugins: { jsx: true },
  });
