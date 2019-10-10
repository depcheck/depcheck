import path from 'path';
import lodash from 'lodash';
import parseES7 from '../parser/es7';
import getNodes from '../utils/parser';

function parseConfigModuleExports(node) {
  // node.left must be assigning to module.exports
  if (node && node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression'
    && node.left.object && node.left.object.type === 'Identifier' && node.left.object.name === 'module'
    && node.left.property && node.left.property.type === 'Identifier' && node.left.property.name === 'exports') {
    const config = {};
    node.right.properties
      .forEach((prop) => {
        if (prop.value.type === 'ArrayExpression' && prop.key.name === 'plugins') {
          const vals = [];
          prop.value.elements
            .forEach((e) => {
              let val;
              switch (e.type) {
                case 'StringLiteral':
                  val = e.value;
                  break;
                case 'ObjectExpression':
                  val = e.properties.reduce((f, g) => {
                    if (f) {
                      return f;
                    }
                    if (g.type === 'ObjectProperty' && g.key.type === 'StringLiteral' && g.key.value === 'resolve' && g.value.type === 'StringLiteral') {
                      return g.value.value;
                    }
                    return false;
                  }, false);
                  break;
                default:
                  val = false;
              }
              if (val) {
                vals.push(val);
              }
            });
          config[prop.key.name] = vals;
        }
      });
    return config;
  }
  return null;
}
function parseConfig(content) {
  const ast = parseES7(content);
  return lodash(getNodes(ast))
    .map(node => parseConfigModuleExports(node))
    .flatten()
    .filter(val => val != null)
    .uniq()
    .first();
}

function loadConfig(filename, content) {
  const basename = path.basename(filename);

  const GatbyConfig = 'gatsby-config.js';
  if (GatbyConfig === basename) {
    const config = parseConfig(content);
    return config.plugins || [];
  }
  return [];
}


export default function parseGatsbyConfig(content, filename) {
  return loadConfig(filename, content);
}
