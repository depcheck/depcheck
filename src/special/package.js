export default function parsePackageJson(content, filepath, deps) {
  // Mark dependencies as "used" if they are used in a script in package.json.
  if (filepath.match(new RegExp('(\\/|\\\\)package.json$'))) {  // Escaping is fun!
    // Grab just the scripts section.
    const scripts = JSON.parse(content).scripts;

    if (scripts) {
      const scriptKeys = Object.keys(scripts);

      if (scriptKeys.length) {
        // Don't count script titles as dependency use.
        let scriptsText = '';
        for (let i = 0; i < scriptKeys.length; i += 1) {
          scriptsText += `${scripts[scriptKeys[i]]} `;
        }

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
    }
  }
  return [];
}
