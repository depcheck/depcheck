import { extractInlineWebpack } from './extract';

export default function detectImportDeclaration(node, deps) {
  if (node.type !== 'ImportDeclaration' || !node.source || !node.source.value) {
    return [];
  }

  // TypeScript "import type X from 'foo'" - doesn't need to depend on the
  // actual module, instead it can rely on `@types/<module>` instead.
  if (
    node.importKind === 'type' &&
    deps.includes(`@types/${node.source.value}`)
  ) {
    return [`@types/${node.source.value}`];
  }

  return extractInlineWebpack(node.source.value);
}
