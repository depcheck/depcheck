import yargs from 'yargs';
import { cosmiconfig } from 'cosmiconfig';
import camelcase from 'camelcase';
import lodash from 'lodash';
import ConfigurationParsingException from './exceptions/configuration-parsing-exception';

function parseCsvArray(value) {
  return (value || '').split(',');
}

function convertObjectToCamelCase(obj) {
  return Object.entries(obj).reduce((newObj, [key, value]) => {
    newObj[camelcase(key)] = value;
    return newObj;
  }, {});
}

function createParsersObject(parsersFromCli) {
  return lodash.isUndefined(parsersFromCli)
    ? undefined
    : lodash(parsersFromCli)
        .map((keyValuePair) => keyValuePair.split(':'))
        .fromPairs()
        .mapValues((value) => value.split('&'))
        .value();
}

export function getCliArgs(args, version) {
  return yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean(['ignore-bin-package', 'skip-missing'])
    .describe('config', 'A config file to be parsed')
    .describe('ignore-bin-package', 'Ignore package with bin entry')
    .describe('skip-missing', 'Skip calculation of missing dependencies')
    .describe('json', 'Output results to JSON')
    .describe('oneline', 'Output results as space separated string')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe(
      'ignore-dirs',
      'Comma separated folder names to ignore (deprecated)',
    )
    .describe(
      'ignore-path',
      'Path to a file with patterns describing files to ignore.',
    )
    .describe(
      'ignore-patterns',
      'Comma separated patterns describing files to ignore.',
    )
    .describe('parsers', 'Comma separated glob:parser pair list')
    .describe('quiet', 'Suppress the "No depcheck issue" message')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .version('version', 'Show version number', version)
    .help('help', 'Show this help message')
    .coerce(
      ['ignores', 'ignore-dirs', 'ignore-patterns', 'detectors', 'specials'],
      parseCsvArray,
    )
    .coerce('parsers', (parsersStr) => {
      const parsers = parseCsvArray(parsersStr);
      return createParsersObject(parsers);
    });
}

/* istanbul ignore next */
function returnNull() {
  return null;
}

export async function getRCFileConfiguration(moduleName, filename, dir) {
  try {
    const configFileExplorer = cosmiconfig(moduleName, {
      // this prevents cosmiconfig from picking up .js configuration files. "null" means no file was found.
      // Gotta extract `() => null` into a function to be able to ignore the line from the code coverage count.
      loaders: { '.js': returnNull },
    });
    const findings = await (filename !== undefined
      ? configFileExplorer.load(filename)
      : configFileExplorer.search(dir));
    return !findings || findings.isEmpty
      ? {}
      : convertObjectToCamelCase(findings.config);
  } catch (error) {
    // It's not documented in cosmiconfig's documentation,
    // but error in this case should be a YAMLException
    throw new ConfigurationParsingException(filename, error);
  }
}

export async function getConfiguration(args, moduleName, version) {
  const dir = args[0] || '.';
  const cliConfig = getCliArgs(args, version);
  const rcConfig = await getRCFileConfiguration(
    moduleName,
    cliConfig.argv.config,
    dir,
  );
  return { ...rcConfig, ...cliConfig.argv };
}
