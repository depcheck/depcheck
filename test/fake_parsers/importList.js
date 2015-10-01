function toRequire(dep) {
  return {
    type: 'ImportDeclaration',
    source: {
      value: dep,
    },
  };
}

export function lite(content) {
  return content.split('\n').filter(line => line);
}

export function full(content) {
  return lite(content).map(toRequire);
}
