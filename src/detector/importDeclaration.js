import { extractInlineWebpack } from './extract';

export default function detectImportDeclaration(node, deps) {
  if (node.type !== 'ImportDeclaration' || !node.source || !node.source.value) {
    return [];
  }

  // TypeScript "import type X from 'foo'" and "import type X from 'foo/bar'"- doesn't need to depend on the
  // actual module, instead it can rely on `@types/<module>` instead.

  const packageName = node.source.value.split('/')[0];
  const typesPackageName = `@types/${packageName}`;

  if (node.importKind === 'type' && deps.includes(typesPackageName)) {
    return [typesPackageName];
  }

  return extractInlineWebpack(node.source.value);
}
