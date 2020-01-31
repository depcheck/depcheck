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
    newObj[camelcase(key)] = value; // eslint-disable-line no-param-reassign
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
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignore-dirs', 'Comma separated folder names to ignore')
    .describe('parsers', 'Comma separated glob:parser pair list')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .version('version', 'Show version number', version)
    .help('help', 'Show this help message')
    .coerce(['ignores', 'ignore-dirs', 'detectors', 'specials'], parseCsvArray)
    .coerce('parsers', (parsersStr) => {
      const parsers = parseCsvArray(parsersStr);
      return createParsersObject(parsers);
    });
}

/* istanbul ignore next */
function returnNull() {
  return null;
}

export async function getRCFileConfiguration(moduleName, filename) {
  try {
    const configFileExplorer = cosmiconfig(moduleName, {
      // this prevents cosmiconfig from picking up .js configuration files. "null" means no file was found.
      // Gotta extract `() => null` into a function to be able to ignore the line from the code coverage count.
      loaders: { '.js': returnNull },
    });
    const findings = await (filename !== undefined
      ? configFileExplorer.load(filename)
      : configFileExplorer.search());
    return !findings || findings.isEmpty
      ? {}
      : convertObjectToCamelCase(findings.config);
  } catch (error) {
    // It's not documented in cosmiconfig's documentation,
    // but error in this case should be a YAMLException
    throw new ConfigurationParsingException(error.mark.name);
  }
}

export async function getConfiguration(args, moduleName, version) {
  const cliConfig = getCliArgs(args, version);
  const rcConfig = await getRCFileConfiguration(
    moduleName,
    cliConfig.argv.config,
  );
  return { ...rcConfig, ...cliConfig.argv };
}
