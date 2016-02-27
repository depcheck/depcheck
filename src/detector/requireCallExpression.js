import lodash from 'lodash';

export default node =>
  node.type === 'CallExpression' &&
  node.callee &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require' &&
  node.arguments[0] &&
  lodash.isString(node.arguments[0].value)
  ? [node.arguments[0].value]
  : [];
