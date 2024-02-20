import path from 'path';
import process from 'process';
import { depseek, fullRe } from 'depseek';
import findup from 'findup-sync';
import { resolve as resolveImports } from 'resolve.imports';
import { memoize } from '../utils/index';
import { getContent } from '../utils/file';
import { getAtTypesName } from '../utils/typescript';

const findUpMemoized = memoize(findup, 500);
async function getClosesPkgJson(filename) {
  return getContent(
    findUpMemoized('package.json', { cwd: path.dirname(filename) }),
  ).then(JSON.parse);
}

function extractPkgName(value) {
  const [o, n] = value.split('/');
  return o[0] === '@' ? `${o}/${n}` : o;
}

export async function fallbackParser(filename) {
  const ext = path.extname(filename);
  const [
    content,
    { dependencies = {}, devDependencies = {}, imports = {} } = {},
  ] = await Promise.all([getContent(filename), getClosesPkgJson(filename)]);
  const importsManifest = {
    content: {
      imports,
    },
  };
  const deps = {
    runtime: [],
    types: [],
  };

  /* Finds grunt plugin setup */
  if (content.startsWith('/* global grunt */')) {
    const gruntDeps = (
      await depseek(content, {
        re: /((\.{3}|\s|[!%&(*+,/:;<=>?[^{|}~-]|^)(grunt\s?(\.\s?tasks\s?)?\.loadNpmTasks\s?\(\s?))\s?$/,
        offset: 25,
      })
    ).map(({ value }) => value);
    deps.runtime.push(...gruntDeps);
  }

  /* Express.js view engine declaration */
  const viewEngine = (/\.\s*set\s*\(\s*['"]view engine['"]\s*,\s*['`"]([^'`"]+)['`"]\s*\)/.exec(
    content,
  ) || [])[1];
  if (viewEngine) {
    deps.runtime.push(viewEngine);
  }

  /* If met svelte template, add svelte to deps */
  if (ext === '.svelte') {
    deps.runtime.push('svelte');
  }

  /* Coffeescript supports `require` w/o brackets */
  const re =
    ext === '.coffee' || ext === '.litcoffee' || ext === '.coffee.md'
      ? /((\.{3}|\s|[!%&(*+,/:;<=>?[^{|}~-]|^)require\s?\(?\s?)\s?$/
      : fullRe;

  let prev = 0;
  (
    await depseek(content, {
      re,
    })
  ).forEach(({ type, value, index }) => {
    if (type === 'dep' && value[0] !== '.' && value[0] !== '/') {
      const [v] = value.split('?');
      const bucket = content.slice(prev, index).includes('import type')
        ? deps.types
        : deps.runtime;

      if (/^(https?|file):/i.test(v)) {
        /* Do nothing with urls */
      } else if (v.includes('!')) {
        /* Extracts custom resolvers: 'resolver!argument' */
        bucket.push(...v.split('!').filter(Boolean).map(extractPkgName));
      } else if (v[0] === '#') {
        /* shebang stands for pkg aliases aka pkg #imports */
        const ref = resolveImports(importsManifest, v, {
          conditions: ['node', 'require', 'import', 'default', 'test'],
        });
        /* type condition to pull only types declarations */
        const typeref = resolveImports(importsManifest, v, {
          conditions: ['types'],
        });

        if (typeref) deps.types.push(extractPkgName(typeref));
        if (ref) bucket.push(extractPkgName(ref));
      } else {
        bucket.push(extractPkgName(v));
      }

      prev = index;
    }
  });

  /* Processes TypeScript external libdefs */
  const maybeTypesDeps = Object.values(deps)
    .flat()
    .map((dep) => {
      return dep.startsWith('@types/') ? dep : getAtTypesName(dep);
    });

  deps.runtime.push(
    ...maybeTypesDeps.filter(
      (dep) => dependencies[dep] || devDependencies[dep],
    ),
  );

  return [...new Set(deps.runtime)];
}

/* Hook to give an alternative parser a try if the main one fails */
export function withFallback(fn) {
  return async (filename) => {
    const { toggle = 'off' } = withFallback;

    if (toggle === 'override') {
      return fallbackParser(filename);
    }

    try {
      return await fn(filename);
    } catch (e) {
      if (toggle === 'on') {
        return fallbackParser(filename);
      }
      throw e;
    }
  };
}

withFallback.toggle = process.env.DEPCHECK_FALLBACK || 'off';
