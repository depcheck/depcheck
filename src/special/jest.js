import path from 'path';
import lodash from 'lodash';
import { evaluate } from '../utils';
const _ = lodash;

const jestConfigRegex = /jest.conf(ig|).js(on|)$/;
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
  } catch (error) {
    return {}; // ignore parse error silently
  }
}

function contain(array, dep, prefix) {
  if (!array) {
    return false;
  }

  if (typeof array === 'string')
    return contain([array], dep, prefix);

  // extract name if wrapping with options
  const names = array.map(item => (lodash.isString(item) ? item : item[0]));
  if (names.indexOf(dep) !== -1) {
    return true;
  }

  if (prefix && dep.indexOf(prefix) === 0) {
    return contain(array, dep.substring(prefix.length), false);
  }

  return false;
}

function filter(deps, options) {
  const runner = deps.filter(dep => (
    contain(options.runner || [], dep, 'jest-runner-')
  ));

  const watchPlugins = deps.filter(dep => (
    contain(options.watchPlugins || [], dep, 'jest-watch-')
  ));

  return _.union(runner, watchPlugins);
}

function checkOptions(deps, options = {}) {
  const pickedOptions = lodash(options)
    .pick(supportedProperties)
    .value();
  return filter(deps, pickedOptions);
}

export default function parseJest(content, filePath, deps, rootDir) {
  const filename = path.basename(filePath);
  if (jestConfigRegex.test(filename)) {
    try {
      // eslint-disable-next-line global-require
      const options = require(filePath) || {};
      return checkOptions(deps, options);
    } catch(error) {
      return [];
    }
  }
  
  if (filename === 'package.json') {
    const metadata = parse(content);
    return checkOptions(deps, metadata.jest);
  }

  return [];
}