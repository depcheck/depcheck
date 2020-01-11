import path from 'path';
import lodash from 'lodash';
import { parseES7Content } from '../parser/es7';
import getNodes from '../utils/parser';
import { getContent } from '../utils/file';

function parseConfigModuleExports(node) {
  // node.left must be assigning to module.exports
  if (
    node &&
    node.type === 'AssignmentExpression' &&
    node.left.type === 'MemberExpression' &&
    node.left.object &&
    node.left.object.type === 'Identifier' &&
    node.left.object.name === 'module' &&
    node.left.property &&
    node.left.property.type === 'Identifier' &&
    node.left.property.name === 'exports'
  ) {
    const config = {};
    node.right.properties.forEach((prop) => {
      if (
        prop.value.type === 'ArrayExpression' &&
        prop.key.name === 'plugins'
      ) {
        const vals = [];
        prop.value.elements
          .filter((e) => e.type === 'StringLiteral')
          .forEach((e) => vals.push(e.value));
        config[prop.key.name] = vals;
      }
    });
    return config;
  }
  return null;
}

async function parseConfig(content) {
  const ast = parseES7Content(content);
  return lodash(getNodes(ast))
    .map((node) => parseConfigModuleExports(node))
    .flatten()
    .filter((val) => val != null)
    .uniq()
    .first();
}

export default async function parseGatsbyConfig(filename) {
  const basename = path.basename(filename);

  const GatbyConfig = 'gatsby-config.js';
  if (GatbyConfig === basename) {
    const content = await getContent(filename);
    const config = await parseConfig(content);
    return config.plugins || [];
  }
  return [];
}
