export default function parsePackageJson(content, filepath, deps) {
  // Mark dependencies as "used" if they are used in a script in package.json.
  if (filepath.endsWith('/package.json')) {
    // Grab just the scripts section.
    const scriptsText = JSON.stringify(JSON.parse(content).scripts);
    if (scriptsText) {
      const depsInScripts = [];
      for (let i = 0; i < deps.length; i += 1) {
        if (scriptsText.indexOf(deps[i]) !== -1) {
          depsInScripts.push(deps[i]);
        }
      }
      return depsInScripts;
    }
  }
  return [];
}
