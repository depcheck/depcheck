import * as path from 'path';
import requirePackageName from 'require-package-name';
import { loadConfig } from '../utils/cli-tools';
import { wrapToArray } from '../utils/index';

function resolvePresetPackage(preset, rootDir) {
  if (preset.startsWith('./') || preset.startsWith('../')) {
    return path.resolve(rootDir, preset);
  }
  return preset;
}

function checkConfig(config, rootDir) {
  let rules = wrapToArray(config.rulesDirectory).filter(
    (ruleDir) => !path.isAbsolute(ruleDir),
  );

  const prettierPlugin = 'tslint-plugin-prettier';
  // If tslint-plugin-prettier is in tslint file
  // then it should also be activated, if not,
  // remove it from the list of used dependencies.
  if (rules.includes(prettierPlugin) && config.rules.prettier !== true) {
    rules = rules.filter((rule) => rule !== prettierPlugin);
  }
  return wrapToArray(config.extends)
    .filter((preset) => !preset.startsWith('tslint:'))
    .map((preset) => resolvePresetPackage(preset, rootDir))
    .filter((preset) => !path.isAbsolute(preset))
    .map(requirePackageName)
    .concat(rules);
}

const configNameRegex = /^tslint\.(json|yaml|yml)$/;

/**
 * Parses TSLint configuration for dependencies.
 *
 * TSLint uses node resolution to load inherited configurations.
 * More info on this can be found
 * [here](https://palantir.github.io/tslint/usage/configuration/).
 */
export default async function parseTSLint(filename, deps, rootDir) {
  const config = await loadConfig('tslint', configNameRegex, filename, rootDir);

  if (config) {
    return ['tslint', ...checkConfig(config, rootDir)];
  }

  return [];
}
