import { parse } from 'babylon';

export default content =>
  parse(content, {
    sourceType: 'module',
  });
