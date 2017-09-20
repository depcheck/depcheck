export default function parsePackageJson(content, filepath, deps) {

  // Mark dependencies as "used" if they are used in a script in package.json.
  if (filepath.endsWith('/package.json')) {
    // Grab just the scripts section.
    const scriptsText = JSON.stringify(JSON.parse(content)['scripts']);
    const depsInScripts = [];
    for (const dependency of deps) {
      if (scriptsText.indexOf(dependency) !== -1) {
        depsInScripts.push(dependency);
      }
    }
    return depsInScripts;
  }

  return [];
}
