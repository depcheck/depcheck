export default node =>
  node.type === 'CallExpression' &&
  node.callee &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require' &&
  node.arguments[0] &&
  typeof node.arguments[0].value === 'string'
  ? [node.arguments[0].value]
  : [];
