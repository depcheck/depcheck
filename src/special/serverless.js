import * as path from 'path';
import yaml from 'js-yaml';
import { getContent } from '../utils/file';

/**
 * Get plugin names from a yaml object.
 * @param {*} yml parsed serverless configuration
 */
function getPlugins(serverlessConfig) {
  return serverlessConfig.plugins;
}

/**
 * Get the dependency names of the given plugins.
 * @param {*} plugins array of plugin names as strings
 */
function getDependencies(plugins) {
  return plugins;
}

export default async function parseServerless(filename) {
  const basename = path.basename(filename);

  if (basename === 'serverless.yml') {
    const content = await getContent(filename);
    const config = yaml.safeLoad(content);
    // TODO This detects plugins from the main serverless.yml, but you could have plugins in included files like this: "plugins: ${file(./serverless.plugins.yml)}"
    return ['serverless', ...getDependencies(getPlugins(config))];
  }

  return [];
}
