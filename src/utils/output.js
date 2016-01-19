function replacer(key, value) {
  if (value instanceof Error) {
    return value.stack;
  }

  return value;
}

function noIssue(result) {
  return result.dependencies.length === 0
      && result.devDependencies.length === 0
      && result.missing.length === 0;
}

function prettify(caption, deps) {
  const list = deps.map(dep => `* ${dep}`);
  return list.length ? [caption].concat(list) : [];
}

export default function output(result, log, argv) {
  return new Promise(resolve => {
    if (argv.json) {
      var clone = Object.assign({}, result);
      if (!argv.used) delete clone.used;
      log(JSON.stringify(clone, replacer));
    } else if (noIssue(result)) {
      const unused = ['No depcheck issue'];
      const used = prettify('Used Dependencies', Object.keys(result.used));
      const content = unused.concat(argv.used ? used : []).join('\n');
      log(content);
    } else {
      const deps = prettify('Unused dependencies', result.dependencies);
      const devDeps = prettify('Unused devDependencies', result.devDependencies);
      const missing = prettify('Missing dependencies', result.missing);
      const used = prettify('Used Dependencies', Object.keys(result.used));
      const content = deps.concat(devDeps, missing, argv.used ? used : []).join('\n');

      log(content);
    }

    resolve(result);
  });
}
