import lodash from 'lodash';

export default function expressViewEngine(node) {
  return node.type === 'CallExpression'
    && node.callee
    && node.callee.property
    && node.callee.property.name === 'set'
    && node.arguments[0]
    && node.arguments[0].value === 'view engine'
    && node.arguments[1]
    && lodash.isString(node.arguments[1].value)
    ? [node.arguments[1].value]
    : [];
}
