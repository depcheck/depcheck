function noUnused(result) {
  return result.dependencies.length === 0
      && result.devDependencies.length === 0;
}

function prettify(caption, deps) {
  const list = deps.map(dep => `* ${dep}`);
  return list.length ? [caption].concat(list) : [];
}

export default function output(result, log, json) {
  return new Promise(resolve => {
    if (json) {
      log(JSON.stringify(result));
    } else if (noUnused(result)) {
      log('No unused dependencies');
    } else {
      const deps = prettify('Unused Dependencies', result.dependencies);
      const devDeps = prettify('\nUnused devDependencies', result.devDependencies);
      const content = deps.concat(devDeps).join('\n');

      log(content);
    }

    resolve(result);
  });
}
