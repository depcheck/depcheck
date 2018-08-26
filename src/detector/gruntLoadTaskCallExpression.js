export default function detectGruntLoadTaskCallExpression(node) {
  return node.type === 'CallExpression'
    && node.callee
    && node.callee.property
    && node.callee.property.name === 'loadNpmTasks'
    && node.arguments[0]
    ? [node.arguments[0].value]
    : [];
}
