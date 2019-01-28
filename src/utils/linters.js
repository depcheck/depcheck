import path from 'path';
import yaml from 'js-yaml';
import lodash from 'lodash';
import requirePackageName from 'require-package-name';
import { evaluate, wrapToArray } from '.';

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    // not JSON format
  }

  try {
    return yaml.safeLoad(content);
  } catch (error) {
    // not YAML format
  }

  try {
    return evaluate(`module.exports = ${content}`);
  } catch (error) {
    // not valid JavaScript code
  }

  // parse fail, return nothing
  return {};
}

function isLinterConfigAnAbsolutePath(specifier) {
  return path.isAbsolute(specifier);
}

function isLinterConfigARelativePath(specifier) {
  return lodash.startsWith(specifier, './') || lodash.startsWith(specifier, '../');
}

function isLinterConfigFromAPlugin(specifier) {
  return lodash.startsWith(specifier, 'plugin:');
}

function isLinterConfigFromAScopedModule(specifier) {
  return lodash.startsWith(specifier, '@');
}

function isLinterConfigFromAFullyQualifiedModuleName(specifier, prefix) {
  return lodash.startsWith(specifier, prefix);
}

function resolvePresetPackage(flavour, preset, rootDir) {
  // inspired from https://github.com/eslint/eslint/blob/5b4a94e26d0ef247fe222dacab5749805d9780dd/lib/config/config-file.js#L347
  if (isLinterConfigAnAbsolutePath(preset)) {
    return preset;
  }
  if (isLinterConfigARelativePath(preset)) {
    return path.resolve(rootDir, preset);
  }

  if (isLinterConfigFromAPlugin(preset)) {
    const pluginName = preset.slice(7, preset.lastIndexOf('/'));
    return normalizePackageName(pluginName, `${flavour}-plugin`);
  }

  return normalizePackageName(preset, `${flavour}-config`);
}

function loadConfig(preset, rootDir) {
  const presetPath = path.isAbsolute(preset)
    ? preset
    : path.resolve(rootDir, 'node_modules', preset);

  try {
    return require(presetPath); // eslint-disable-line global-require
  } catch (error) {
    return {}; // silently return nothing
  }
}

/**
 * Brings package name to correct format based on prefix
 * @param {string} name The name of the package.
 * @param {string} prefix Can be either "eslint-plugin", "eslint-config" or "eslint-formatter"
 * @returns {string} Normalized name of the package
 * @private
 * @see {@link https://github.com/eslint/eslint/blob/faf3c4eda0d27323630d0bc103a99dd0ecffe842/lib/util/naming.js#L25 ESLint}
 */
function normalizePackageName(name, prefix) {
  let normalizedName = name;
  const convertPathToPosix = p => path.normalize(p).replace(/\\/g, '/');

  /**
   * On Windows, name can come in with Windows slashes instead of Unix slashes.
   * Normalize to Unix first to avoid errors later on.
   * https://github.com/eslint/eslint/issues/5644
   */
  if (normalizedName.indexOf('\\') > -1) {
    normalizedName = convertPathToPosix(normalizedName);
  }

  if (normalizedName.charAt(0) === '@') {
    /**
     * it's a scoped package
     * package name is the prefix, or just a username
     */
    const scopedPackageShortcutRegex = new RegExp(`^(@[^/]+)(?:/(?:${prefix})?)?$`);
    const scopedPackageNameRegex = new RegExp(`^${prefix}(-|$)`);

    if (scopedPackageShortcutRegex.test(normalizedName)) {
      normalizedName = normalizedName
        .replace(scopedPackageShortcutRegex, `$1/${prefix}`);
    } else if (!scopedPackageNameRegex.test(normalizedName.split('/')[1])) {
      /**
       * for scoped packages, insert the prefix after the first / unless
       * the path is already @scope/eslint or @scope/eslint-xxx-yyy
       */
      normalizedName = normalizedName
        .replace(/^@([^/]+)\/(.*)$/, `@$1/${prefix}-$2`);
    }
  } else if (normalizedName.indexOf(`${prefix}-`) !== 0) {
    normalizedName = `${prefix}-${normalizedName}`;
  }

  return normalizedName;
}

function checkConfig(flavour, config, rootDir) {
  const parser = wrapToArray(config.parser);
  const plugins = wrapToArray(config.plugins)
    .map(plugin => normalizePackageName(plugin, `${flavour}-plugin`));

  const presets = wrapToArray(config.extends)
    .filter(preset => preset !== `${flavour}:recommended`)
    .map(preset => resolvePresetPackage(flavour, preset, rootDir));

  const presetPackages = presets
    .filter(preset => !path.isAbsolute(preset))
    .map(requirePackageName);

  const presetDeps = lodash(presets)
    .map(preset => loadConfig(preset, rootDir))
    .map(presetConfig => checkConfig(flavour, presetConfig, rootDir))
    .flatten()
    .value();

  return lodash.union(parser, plugins, presetPackages, presetDeps);
}

export default function parseLinter(flavour, content, filename, deps, rootDir) {
  const basename = path.basename(filename);
  const filenameRegex = new RegExp(`^\\.?${flavour}(rc)?(\\.json|\\.js|\\.yml|\\.yaml)?$`);
  if (filenameRegex.test(basename)) {
    const config = parse(content);
    return checkConfig(flavour, config, rootDir);
  }

  return [];
}
