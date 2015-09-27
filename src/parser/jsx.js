import * as acorn from 'acorn-jsx';

export default content =>
  acorn.parse(content, {
    ecmaVersion: 6,
    sourceType: 'module',
    allowHashBang: true,
    plugins: { jsx: true },
  });
