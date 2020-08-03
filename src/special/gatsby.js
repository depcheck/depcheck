import path from 'path';
import lodash from 'lodash';
import { parseES7Content } from '../parser/es7';
import getNodes from '../utils/parser';
import { getContent } from '../utils/file';

function findStringPlugins(pluginElementsArray) {
  return pluginElementsArray
    .filter((e) => e.type === 'StringLiteral')
    .map((e) => e.value);
}

function findResolvePlugins(pluginElementsArray) {
  return pluginElementsArray
    .filter((e) => e.type === 'ObjectExpression')
    .map((e) => e.properties)
    .reduce((acc, props) => acc.concat(props), [])
    .filter(
      (resolvePropCandidate) =>
        resolvePropCandidate.key.value === 'resolve' &&
        resolvePropCandidate.value &&
        resolvePropCandidate.value.type === 'StringLiteral',
    )
    .map((resolveProp) => resolveProp.value.value);
}

function findNestedPlugins(pluginElementsArray) {
  return (
    pluginElementsArray
      .filter((e) => e.type === 'ObjectExpression')
      .map((e) => e.properties)
      .reduce((acc, props) => acc.concat(props), [])
      .filter(
        (optionsPropCandidate) =>
          optionsPropCandidate &&
          optionsPropCandidate.key &&
          optionsPropCandidate.key.value === 'options' &&
          optionsPropCandidate.value &&
          optionsPropCandidate.value.type === 'ObjectExpression',
      )
      // eslint-disable-next-line no-use-before-define
      .map((optionsNode) => findPluginsInObjectExpression(optionsNode.value))
      .reduce((deps, dep) => deps.concat(dep), [])
  );
}

function findPluginsInObjectExpression(node) {
  const dependencies = [];
  node.properties.forEach((prop) => {
    if (
      prop.value.type === 'ArrayExpression' &&
      (prop.key.name === 'plugins' || prop.key.value === 'plugins')
    ) {
      const vals = [];

      vals.push(...findResolvePlugins(prop.value.elements));
      vals.push(...findStringPlugins(prop.value.elements));
      vals.push(...findNestedPlugins(prop.value.elements));

      dependencies.push(...vals);
    }
  });
  return dependencies;
}

/**
 *
 *
 * @param {Object} node Root node of the gatsby.config.js file
 *
 */
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
    const plugins = findPluginsInObjectExpression(node.right);
    return { plugins };
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
