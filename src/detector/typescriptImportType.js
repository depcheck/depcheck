export default function detectTypescriptImportType(node) {
  return node.type === 'TSImportType'
    && node.argument
    && node.argument.value
    ? [node.argument.value]
    : [];
}
