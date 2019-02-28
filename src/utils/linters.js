import path from 'path';
import yaml from 'js-yaml';
import { evaluate } from '.';

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

  // parse fail, return nothing
  return {};
}


export function loadConfig(flavour, filename, content) {
  const basename = path.basename(filename);
  const filenameRegex = new RegExp(`^\\.?${flavour}(rc)?(\\.json|\\.js|\\.yml|\\.yaml)?$`);
  if (filenameRegex.test(basename)) {
    const config = parse(content);
    return config;
  }

  return null;
}
