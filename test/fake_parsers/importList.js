function toRequire(dep) {
  return {
    type: 'ImportDeclaration',
    source: {
      type: 'Literal',
      value: dep,
    },
  };
}

export function lite(content) {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line);
}

export function full(content) {
  return lite(content).map(toRequire);
}
