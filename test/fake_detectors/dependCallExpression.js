export default function parse(node) {
  return node.type === 'CallExpression' &&
    node.callee &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'depend'
    ? node.arguments.map((arg) => arg.value)
    : [];
}
