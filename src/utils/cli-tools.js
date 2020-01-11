import yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import { evaluate } from '.';
import getScripts from './get-scripts';
import { getContent } from './file';

const optionKeysForConfig = {
  babel: ['--config-file'],
  eslint: ['--config', '-c'],
  tslint: ['--config', '-c'],
};

export function parse(content) {
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

  try {
    return evaluate(content);
  } catch (error) {
    // not valid JavaScript code
  }

  // parse fail, return nothing
  return null;
}

export async function getCustomConfig(binName, filename, rootDir) {
  const scripts = await getScripts(filename);

  if (scripts.length === 0) {
    return null;
  }

  const script = scripts.find((s) => s.split(/\s+/).includes(binName));

  if (script) {
    const commands = script.split('&&');
    const command = commands.find((c) => c.startsWith(binName));

    const optionsKeys = optionKeysForConfig[binName];

    if (command && optionsKeys) {
      const args = command.split(/\s+/);
      const configIdx = args.findIndex((arg) => optionsKeys.includes(arg));

      if (configIdx !== -1 && args[configIdx + 1]) {
        const configFile = args[configIdx + 1];
        const configPath = path.resolve(rootDir, configFile);

        const configContent = fs.readFileSync(configPath);
        return parse(configContent);
      }
    }
  }

  return null;
}

export async function loadConfig(binName, filenameRegex, filename, rootDir) {
  const basename = path.basename(filename);

  if (filenameRegex.test(basename)) {
    const content = await getContent(filename);
    const config = parse(content);
    return config;
  }

  const custom = await getCustomConfig(binName, filename, rootDir);

  if (custom) {
    return custom;
  }

  return null;
}
