import { extractInlineWebpack } from './extract';

export default function detectImportDeclaration(node) {
  return node.type === 'ImportDeclaration' && node.source && node.source.value
    ? [extractInlineWebpack(node.source.value)]
    : [];
}
