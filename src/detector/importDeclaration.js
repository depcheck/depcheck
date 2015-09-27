export default node =>
  node.type === 'ImportDeclaration' &&
  node.source &&
  node.source.value
  ? [node.source.value]
  : [];
