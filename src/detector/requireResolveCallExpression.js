import lodash from 'lodash';

export default function detectRequireCallExpression(node) {
  return node.type === 'CallExpression'
    && node.callee
    && node.callee.type === 'MemberExpression'
    && node.callee.object
    && node.callee.object.name === 'require'
    && node.callee.property
    && node.callee.property.name === 'resolve'
    && node.arguments[0]
    && lodash.isString(node.arguments[0].value)
    ? [node.arguments[0].value]
    : [];
}
