import { parse } from 'babylon';

export const config = {
  sourceType: 'module',
  features: {
    // Enable all possible experimental features.
    // Because we only parse them, not evaluate any code, it is safe to do so.
    // Reference Babel docs: https://babeljs.io/docs/usage/experimental/
    'es7.asyncFunctions': true,
    'es7.classProperties': true,
    'es7.comprehensions': true,
    'es7.decorators': true,
    'es7.doExpressions': true,
    'es7.exponentiationOperator': true,
    'es7.exportExtensions': true,
    'es7.functionBind': true,
    'es7.objectRestSpread': true,
    'es7.trailingFunctionCommas': true,
  },
};

export default content =>
  parse(content, config);
