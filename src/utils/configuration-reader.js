import yargs from 'yargs';
import cosmiconfig from 'cosmiconfig';
import camelcase from 'camelcase';
import ConfigurationParsingException from './exceptions/configuration-parsing-exception';

export function configureCliArgs(args, version) {
  return yargs(args)
    .usage('Usage: $0 [DIRECTORY]')
    .boolean(['ignore-bin-package', 'skip-missing'])
    .default({
      'ignore-bin-package': false,
      'skip-missing': false,
    })
    .describe('ignore-bin-package', 'Ignore package with bin entry')
    .describe('skip-missing', 'Skip calculation of missing dependencies')
    .describe('json', 'Output results to JSON')
    .describe('ignores', 'Comma separated package list to ignore')
    .describe('ignores-file', 'Path of a lines separated package list file to ignore')
    .describe('ignore-dirs', 'Comma separated folder names to ignore')
    .describe('parsers', 'Comma separated glob:parser pair list')
    .describe('detectors', 'Comma separated detector list')
    .describe('specials', 'Comma separated special parser list')
    .version('version', 'Show version number', version)
    .help('help', 'Show this help message');
}

function convertObjectToCamelCase(obj) {
  return Object.entries(obj).reduce((newObj, [key, value]) => {
    newObj[camelcase(key)] = value; // eslint-disable-line no-param-reassign
    return newObj;
  }, {});
}

export async function getRCFileConfiguration(moduleName) {
  try {
    const configFileExplorer = cosmiconfig(moduleName);
    const findings = await configFileExplorer.search();
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
  const rcConfig = await getRCFileConfiguration(moduleName);
  const cliConfig = configureCliArgs(args, version);

  return { ...rcConfig, ...cliConfig.argv };
}
