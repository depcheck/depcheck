import DepsRegex from 'deps-regex';
import { getContent } from '../utils/file';

const re = new DepsRegex({ matchES6: false });

export default async function parseCoffeeScript(filename) {
  const content = await getContent(filename);
  return re.getDependencies(content);
}
