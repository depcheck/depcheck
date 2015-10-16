import DepsRegex from 'deps-regex';
const re = new DepsRegex();

export default content =>
  re.getDependencies(content);
