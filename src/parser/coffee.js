import DepsRegex from 'deps-regex';

const re = new DepsRegex({ matchES6: false });

export default function parseCoffeeScript(content) {
  return re.getDependencies(content);
}
