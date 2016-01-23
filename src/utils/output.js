function replacer(key, value) {
  if (value instanceof Error) {
    return value.stack;
  }

  return value;
}

function noIssue(result) {
  return result.dependencies.length === 0
      && result.devDependencies.length === 0
      && Object.keys(result.missing).length === 0;
}

function prettify(caption, deps) {
  const list = deps.map(dep => `* ${dep}`);
  return list.length ? [caption].concat(list) : [];
}

export default function output(result, log, json) {
  return new Promise(resolve => {
    if (json) {
      log(JSON.stringify(result, replacer));
    } else if (noIssue(result)) {
      log('No depcheck issue');
    } else {
      const deps = prettify('Unused dependencies', result.dependencies);
      const devDeps = prettify('Unused devDependencies', result.devDependencies);
      const missing = prettify('Missing dependencies', Object.keys(result.missing));
      const content = deps.concat(devDeps, missing).join('\n');

      log(content);
    }

    resolve(result);
  });
}
