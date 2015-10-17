import DepsRegex from 'deps-regex';
const re = new DepsRegex({matchES6: false});

export default content =>
  re.getDependencies(content);
