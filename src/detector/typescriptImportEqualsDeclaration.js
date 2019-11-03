export default function detectTypescriptImportEqualsDeclaration(node) {
  return node.type === 'TSImportEqualsDeclaration' &&
    node.moduleReference &&
    node.moduleReference.expression
    ? [node.moduleReference.expression.value]
    : [];
}
