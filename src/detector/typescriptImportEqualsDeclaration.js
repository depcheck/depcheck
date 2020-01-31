import { extractInlineWebpack } from './extract';

export default function detectTypescriptImportEqualsDeclaration(node) {
  return node.type === 'TSImportEqualsDeclaration' &&
    node.moduleReference &&
    node.moduleReference.expression
    ? [extractInlineWebpack(node.moduleReference.expression.value)]
    : [];
}
