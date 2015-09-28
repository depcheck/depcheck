function makeRequireNode(dependency) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'require',
    },
    arguments: [
      { value: dependency },
    ],
  };
}

export default (content, filename, deps, dir) =>
  makeRequireNode('bin');
