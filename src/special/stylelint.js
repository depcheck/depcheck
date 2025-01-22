import lodash from 'lodash';
import path from 'path';
import requirePackageName from 'require-package-name';
import { loadModuleData, wrapToArray } from '../utils';
import { loadConfig } from '../utils/cli-tools';
import { getContent } from '../utils/file';

function resolveConfigModule(preset, rootDir) {
  const presetParts = preset.split('/');
  let moduleName = presetParts.shift();
  if (moduleName.startsWith('@')) {
    moduleName += `/${presetParts.shift()}`;
  }
  const moduleData = loadModuleData(moduleName, rootDir);
  const includedDeps =
    moduleData.metadata &&
    moduleData.metadata.dependencies &&
    typeof moduleData.metadata.dependencies === 'object'
      ? Object.keys(moduleData.metadata.dependencies)
      : [];
  return [
    moduleData.path && path.resolve(moduleData.path, ...presetParts),
    includedDeps,
  ];
}

function requireConfig(preset, rootDir) {
  const [presetPath, includedDeps] = path.isAbsolute(preset)
    ? [preset, []]
    : resolveConfigModule(preset, rootDir);

  try {
    return [require(presetPath), includedDeps]; // stylelint-disable-line global-require
  } catch (error) {
    return [{}, []]; // silently return nothing
  }
}

/**
 * Brings package name to correct format based on prefix
 * @param {string} name The name of the package.
 * @param {string} prefix Can be either "stylelint-plugin", "stylelint-config" or "stylelint-formatter"
 * @returns {string} Normalized name of the package
 * @private
 */
function normalizePackageName(name, prefix) {
  let normalizedName = name;
  const convertPathToPosix = (p) => path.normalize(p).replace(/\\/g, '/');

  /**
   * On Windows, name can come in with Windows slashes instead of Unix slashes.
   * Normalize to Unix first to avoid errors later on.
   */
  if (normalizedName.indexOf('\\') > -1) {
    normalizedName = convertPathToPosix(normalizedName);
  }

  if (normalizedName.charAt(0) === '@') {
    /**
     * it's a scoped package
     * package name is the prefix, or just a username
     */
    const scopedPackageShortcutRegex = new RegExp(
      `^(@[^/]+)(?:/(?:${prefix})?)?$`,
    );
    const scopedPackageNameRegex = new RegExp(`^${prefix}(-|$)`);

    if (scopedPackageShortcutRegex.test(normalizedName)) {
      normalizedName = normalizedName.replace(
        scopedPackageShortcutRegex,
        `$1/${prefix}`,
      );
    } else if (!scopedPackageNameRegex.test(normalizedName.split('/')[1])) {
      /**
       * for scoped packages, insert the prefix after the first / unless
       * the path is already @scope/stylelint or @scope/stylelint-xxx-yyy
       */
      normalizedName = normalizedName.replace(
        /^@([^/]+)\/(.*)$/,
        `@$1/${prefix}-$2`,
      );
    }
  } else if (normalizedName.indexOf(`${prefix}-`) !== 0) {
    normalizedName = `${prefix}-${normalizedName}`;
  }

  return normalizedName;
}

function resolvePresetPackage(preset, rootDir) {
  // inspired from https://github.com/eslint/eslint/blob/5b4a94e26d0ef247fe222dacab5749805d9780dd/lib/config/config-file.js#L347
  if (path.isAbsolute(preset)) {
    return preset;
  }
  if (preset.startsWith('./') || preset.startsWith('../')) {
    return path.resolve(rootDir, preset);
  }

  if (preset.startsWith('plugin:')) {
    const pluginName = preset.slice(7, preset.lastIndexOf('/'));
    return normalizePackageName(pluginName, 'stylelint-plugin');
  }

  return normalizePackageName(preset, 'stylelint-config');
}

function checkConfig(config, rootDir, includedDeps = []) {
  const configs = [config];
  if (config.overrides) {
    configs.push(...config.overrides);
  }



  const plugins = lodash(configs)
    .map((value) => wrapToArray(value.plugins))
    .flatten()
    .map((plugin) => normalizePackageName(plugin, 'stylelint-plugin'))
    .value();

  const parser = lodash(configs)
    .map((value) => wrapToArray(value.parser))
    .flatten()
    .value();


  const extendsArray = lodash(configs)
    .map((value) => wrapToArray(value.extends))
    .flatten()
    .value();

  const presets = extendsArray
    .filter((preset) => !['stylelint:recommended', 'stylelint:all'].includes(preset))
    .map((preset) => resolvePresetPackage(preset, rootDir));

  const presetPackages = presets
    .filter((preset) => !path.isAbsolute(preset))
    .map(requirePackageName);

  const presetDeps = lodash(presets)
    .map((preset) => requireConfig(preset, rootDir))
    .map(([presetConfig, deps]) => checkConfig(presetConfig, rootDir, deps))
    .flatten()
    .value();

  const result = lodash
    .union(parser, plugins, presetPackages, presetDeps)
    .filter((dep) => !includedDeps.includes(dep));

  // TODO: this require more investigation
  configs.forEach((value) => {
    if (value.settings) {
      Object.keys(value.settings).forEach((key) => {
        if (key !== 'import/resolver') {
          return;
        }
        Object.keys(value.settings[key]).forEach((resolverName) => {
          // node and webpack resolvers are included in `stylelint-plugin-import`
          if (!['node', 'webpack'].includes(resolverName)) {
            result.push(`eslint-import-resolver-${resolverName}`);
          }
        });
      });
    }
  });

  return result;
}

// https://stylelint.io/user-guide/configure/
const configNameRegex = /^stylelint.config(\.(js|cjs))$|^stylelintrc(\.(cjs|js|json|yaml|yml))?$/;

export default async function parseStylelint(filename, deps, rootDir) {


  const config = await loadConfig('stylelint', configNameRegex, filename, rootDir);


  if (config) {
    return checkConfig(config, rootDir);
  }

  const packageJsonPath = path.resolve(rootDir, 'package.json');
  const resolvedFilePath = path.resolve(rootDir, filename);


  if (resolvedFilePath === packageJsonPath) {
    const content = await getContent(filename);
    const parsed = JSON.parse(content);
    if (parsed.stylelint ) {
      return checkConfig(parsed.stylelint, rootDir);
    }
  }

  return [];
}
