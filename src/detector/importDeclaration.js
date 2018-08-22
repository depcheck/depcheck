export default function detectImportDeclaration(node) {
  return node.type === 'ImportDeclaration'
    && node.source
    && node.source.value
    ? [node.source.value]
    : [];
}
