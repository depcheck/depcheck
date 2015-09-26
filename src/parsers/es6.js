import * as acorn from 'acorn';

export default content =>
  acorn.parse(content, {
    ecmaVersion: 6,
    sourceType: 'module',
    allowHashBang: true,
  });
