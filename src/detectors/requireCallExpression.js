export default node =>
  node.type === 'CallExpression' &&
  node.callee &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require' &&
  node.arguments[0]
  ? [node.arguments[0].value]
  : [];
