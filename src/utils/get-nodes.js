function recursive(ast, visited) {
  const nodes = [];

  if (ast && ast.type && !visited.has(ast)) {
    visited.add(ast);
    nodes.push(ast);
  }

  if (Array.isArray(ast)) {
    return nodes.concat(...ast.map(node => recursive(node, visited)));
  } else if (ast && ast instanceof Object) {
    return nodes.concat(...Object.keys(ast)
      .filter(key => key !== 'tokens' && key !== 'comments')
      .map(key => recursive(ast[key], visited)));
  }

  return nodes;
}

export default function getNodes(ast) {
  const visited = new WeakSet();
  const nodes = recursive(ast, visited);
  return nodes;
}
