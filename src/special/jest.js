import path from 'path';
import lodash from 'lodash';
import { getContent } from '../utils/file';

const _ = lodash;

const jestConfigRegex = /^jest.([^.]+\.)?conf(ig|)\.(cjs|mjs|js|json|ts)$/;
const supportedProperties = [
  'dependencyExtractor',
  'preset',
  'prettierPath',
  'reporters',
  'runner',
  'setupFiles',
  'setupFilesAfterEnv',
  'snapshotResolver',
  'snapshotSerializers',
  'testEnvironment',
  'testResultsProcessor',
  'testRunner',
  'transform',
  'watchPlugins',
];

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (_error) {
    return {}; // ignore parse error silently
  }
}

function contain(array, dep, prefix) {
  if (!array) {
    return false;
  }

  if (typeof array === 'string') {
    return contain([array], dep, prefix);
  }

  // extract name if wrapping with options
  const names = array.map((item) => (lodash.isString(item) ? item : item[0]));
  if (names.indexOf(dep) !== -1) {
    return true;
  }

  if (prefix && dep.indexOf(prefix) === 0) {
    return contain(array, dep.substring(prefix.length), false);
  }

  return false;
}

function removeNodeModuleRelativePaths(filepath) {
  if (Array.isArray(filepath)) {
    return removeNodeModuleRelativePaths(filepath[0]);
  }
  return (
    filepath
      .replace(/^.*node_modules\//, '')
      // Strip off subdirectories or exports from package name,
      // e.g. @foo/bar/baz -> @foo/bar, bar/baz -> baz
      .replace(/^((?:@[^/]+\/)?[^@/]+)(?:\/.*)?/, '$1')
  );
}

function filter(deps, options) {
  const runner = deps.filter((dep) =>
    contain(options.runner, dep, 'jest-runner-'),
  );

  const watchPlugins = deps.filter((dep) =>
    contain(options.watchPlugins, dep, 'jest-watch-'),
  );

  const testEnvironment = deps.filter((dep) =>
    contain(options.testEnvironment, dep, 'jest-environment-'),
  );

  const otherProps = lodash(options)
    .entries()
    .map(([prop, value]) => {
      if (prop === 'transform') {
        return _.values(value).map(removeNodeModuleRelativePaths);
      }
      if (Array.isArray(value)) {
        return value.map(removeNodeModuleRelativePaths);
      }
      return removeNodeModuleRelativePaths(value);
    })
    .flatten()
    .intersection(deps)
    .value();

  return _.uniq(
    runner.concat(watchPlugins).concat(testEnvironment).concat(otherProps),
  );
}

function checkOptions(deps, options = {}) {
  const pickedOptions = lodash(options).pick(supportedProperties).value();
  const baseFoundDeps = filter(deps, pickedOptions);
  if (options.projects) {
    const projectDeps = options.projects.map((projectConfig) =>
      checkOptions(deps, projectConfig),
    );
    return baseFoundDeps.concat(...projectDeps);
  }
  return baseFoundDeps;
}

export default async function parseJest(filename, deps, rootDir) {
  const basename = path.basename(filename);
  if (jestConfigRegex.test(basename)) {
    try {
      const config = require(filename) ?? {};
      const options =
        path.extname(filename) === '.ts' ? config.default : config;

      return checkOptions(deps, options);
    } catch (_error) {
      return [];
    }
  }

  const packageJsonPath = path.resolve(rootDir, 'package.json');
  const resolvedFilePath = path.resolve(rootDir, filename);

  if (resolvedFilePath === packageJsonPath) {
    const content = await getContent(filename);
    const metadata = parse(content);
    return checkOptions(deps, metadata.jest);
  }

  return [];
}
