import * as path from 'path';
import requirePackageName from 'require-package-name';
import { loadConfig } from '../utils/linters';
import { wrapToArray } from '../utils/index';

function resolvePresetPackage(preset, rootDir) {
  if (preset.startsWith('./') || preset.startsWith('../')) {
    return path.resolve(rootDir, preset);
  }
  return preset;
}

function checkConfig(config, rootDir) {
  return wrapToArray(config.extends)
    .filter(preset => !preset.startsWith('tslint:'))
    .map(preset => resolvePresetPackage(preset, rootDir))
    .filter(preset => !path.isAbsolute(preset))
    .map(requirePackageName);
}

const configNameRegex = /^tslint\.(json|yaml|yml)$/;

/**
 * Parses TSLint configuration for dependencies.
 *
 * TSLint uses node resolution to load inherited configurations.
 * More info on this can be found
 * [here](https://palantir.github.io/tslint/usage/configuration/).
 */
export default function parseTSLint(content, filename, deps, rootDir) {
  const config = loadConfig(
    'tslint',
    configNameRegex,
    filename,
    content,
    rootDir,
  );

  if (config) {
    return ['tslint', ...checkConfig(config, rootDir)];
  }

  return [];
}
