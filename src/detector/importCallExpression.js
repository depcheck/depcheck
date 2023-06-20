import lodash from 'lodash';

export default function importCallExpression(node) {
  if (
    node.type === 'CallExpression' &&
    node.callee &&
    ((node.callee.type === 'Identifier' && node.callee.name === 'import') ||
      node.callee.type === 'Import' ||
      (node.callee.type === 'MemberExpression' &&
        node.callee.object &&
        node.callee.object.name === 'System' &&
        node.callee.property &&
        node.callee.property.name === 'import')) &&
    node.arguments[0]
  ) {
    if (lodash.isString(node.arguments[0].value)) {
      return [node.arguments[0].value];
    }
    if (
      node.arguments[0].type === 'TemplateLiteral' &&
      node.arguments[0].quasis.length === 1 &&
      lodash.isString(node.arguments[0].quasis[0].value.raw)
    ) {
      return [node.arguments[0].quasis[0].value.raw];
    }
  }
  return [];
}
