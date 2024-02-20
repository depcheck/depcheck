import DepsRegex from 'deps-regex';
import { withFallback } from './fallback';
import { getContent } from '../utils/file';

const re = new DepsRegex({ matchES6: false });

export default withFallback(async function parseCoffeeScript(filename) {
  const content = await getContent(filename);
  return re.getDependencies(content);
});
