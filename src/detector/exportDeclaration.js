export default function detectExportDeclaration(node) {
  return (node.type === 'ExportNamedDeclaration' ||
    node.type === 'ExportAllDeclaration') &&
    node.source &&
    node.source.value
    ? [node.source.value]
    : [];
}
