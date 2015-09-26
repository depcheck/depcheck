export default content =>
  content
  .split('\n')
  .filter(line => line)
  .map(line => ({
    type: 'ImportDeclaration',
    source: {
      value: line,
    },
  }));
