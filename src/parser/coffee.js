import DepsRegex from 'deps-regex';
import { getContent } from '../utils/file';
import fastParser from './fast';

const re = new DepsRegex({ matchES6: false });

export default async function parseCoffeeScript(filename) {
  try {
    return fastParser(filename);

  } catch (e) {
    console.error('!!!!!',e);
  }


  const content = await getContent(filename);
  console.log('!!!!2', re.getDependencies(content));
  return re.getDependencies(content);
}
