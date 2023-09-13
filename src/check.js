import path from 'path';
import debug from 'debug';
import isCore from 'is-core-module';
import lodash from 'lodash';
import readdirp from 'readdirp';
import minimatch from 'minimatch';
import requirePackageName from 'require-package-name';
import { loadModuleData, readJSON } from './utils';
import getNodes from './utils/parser';
import { getAtTypesName } from './utils/typescript';
import { availableParsers } from './constants';

function isModule(dir) {
  try {
    readJSON(path.resolve(dir, 'package.json'));
    return true;
  } catch (error) {
    return false;
  }
}

function mergeBuckets(object1, object2) {
  return lodash.mergeWith(object1, object2, (value1, value2) => {
    const array1 = value1 || [];
    const array2 = value2 || [];
    return array1.concat(array2);
  });
}

function detect(detectors, node, deps) {
  return lodash(detectors)
    .map((detector) => {
      try {
        return detector(node, deps);
      } catch (error) {
        return [];
      }
    })
    .flatten()
    .value();
}

// Apply imports map from package.json to a discovered dependency.  If the
// dependency starts with '#' and we have a matching entry in "imports" in
// the package.json we'll substitute the possible mapped imports in place of
// that dependency.
//
// Conditions can be well-known ones implemented by node, TypeScript, or webpack like
// "import", "browser", "types", or "require".  They can also be custom ones as configurable
// in webpack configuration or using the enhanced-resolve package.
//
// See also:
//   - https://nodejs.org/api/packages.html#subpath-imports
//   - https://www.typescriptlang.org/docs/handbook/esm-node.html
//   - https://webpack.js.org/configuration/resolve/#resolveconditionnames
function applyImportsMap(importsMap, dep) {
  const resolvedDeps = [];

  function accumulateDeps(v, wildcardMatch) {
    if (v) {
      if (typeof v === 'string') {
        resolvedDeps.push(
          wildcardMatch && v.includes('*')
            ? v.replaceAll('*', wildcardMatch)
            : v,
        );
      } else if (typeof v === 'object') {
        Object.values(v).forEach((vv) => accumulateDeps(vv, wildcardMatch));
      }
    }
  }

  // Match input against the path pattern; if it matches, and there was a wildcard in the patten,
  // return the part of the input that matched the wildcard.  If there was no wildcard, return
  // an empty string.
  function matchPathPattern(pattern, input) {
    if (pattern.includes('*')) {
      const escapedPattern = pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regexPattern = escapedPattern.replace(/\\\*/g, '.*');
      debug('depcheck:applyImportsMap:matchPathPattern:regexPattern')(
        pattern,
        input,
        regexPattern,
      );
      const regex = new RegExp(`^${regexPattern}$`);
      const match = input.match(regex);
      if (match) {
        return match[0];
      }
    } else if (pattern === input) {
      return '';
    }
    return null;
  }

  if (dep.startsWith('#')) {
    Object.entries(importsMap).forEach((m) => {
      const match = matchPathPattern(m[0], dep);
      if (match !== null) {
        accumulateDeps(m[1], match);
      }
    });
    if (resolvedDeps.length) {
      debug('depcheck:applyImportsMap:resolved')(dep, resolvedDeps);
      return resolvedDeps;
    }
    debug('depcheck:applyImportsMap:unresolved')(dep);
  }
  return [dep];
}

function discoverPropertyDep(rootDir, deps, property, depName) {
  const { metadata } = loadModuleData(depName, rootDir);
  if (!metadata) return [];
  const propertyDeps = Object.keys(metadata[property] || {});
  return lodash.intersection(deps, propertyDeps);
}

async function getDependencies({
  deps,
  dir,
  filename,
  detectors,
  importsMap,
  parser,
}) {
  const result = await parser(filename, deps, dir);

  // when parser returns string array, skip detector step and treat them as dependencies.
  const dependencies =
    lodash.isArray(result) && result.every(lodash.isString)
      ? result
      : lodash(getNodes(result))
          .map((node) => detect(detectors, node, deps))
          .flatten()
          .uniq()
          .flatMap(lodash.partial(applyImportsMap, importsMap))
          .map(requirePackageName)
          .thru((_dependencies) =>
            parser === availableParsers.typescript
              ? // If this is a typescript file, importing foo would also use @types/foo, but
                // only if @types/foo is already a specified dependency.
                lodash(_dependencies)
                  .map((dependency) => {
                    const atTypesName = getAtTypesName(dependency);
                    return deps.includes(atTypesName)
                      ? [dependency, atTypesName]
                      : [dependency];
                  })
                  .flatten()
                  .value()
              : _dependencies,
          )
          .value();

  const discover = lodash.partial(discoverPropertyDep, dir, deps);
  const discoverPeerDeps = lodash.partial(discover, 'peerDependencies');
  const discoverOptionalDeps = lodash.partial(discover, 'optionalDependencies');
  const peerDeps = lodash(dependencies).map(discoverPeerDeps).flatten().value();
  const optionalDeps = lodash(dependencies)
    .map(discoverOptionalDeps)
    .flatten()
    .value();

  return lodash(dependencies)
    .concat(peerDeps)
    .concat(optionalDeps)
    .filter((dep) => dep && dep !== '.' && dep !== '..') // TODO why need check?
    .filter((dep) => !isCore(dep))
    .uniq()
    .value();
}

function checkFile({ deps, detectors, dir, filename, importsMap, parsers }) {
  debug('depcheck:checkFile')(filename);

  const targets = lodash(parsers)
    .keys()
    .filter((glob) => minimatch(filename, glob, { dot: true }))
    .map((key) => parsers[key])
    .flatten()
    .value();

  return targets.map((parser) =>
    getDependencies({
      deps,
      detectors,
      dir,
      filename,
      importsMap,
      parser,
    }).then(
      (using) => {
        if (using.length) {
          debug('depcheck:checkFile:using')(filename, parser, using);
        }
        return {
          using: {
            [filename]: using,
          },
        };
      },
      (error) => {
        debug('depcheck:checkFile:error')(filename, parser, error);
        return {
          invalidFiles: {
            [filename]: error,
          },
        };
      },
    ),
  );
}

function checkDirectory({
  dir,
  rootDir,
  ignorer,
  importsMap,
  deps,
  parsers,
  detectors,
}) {
  debug('depcheck:checkDirectory')(dir);

  return new Promise((resolve) => {
    const promises = [];

    const finder = readdirp(dir, {
      fileFilter: (entry) => !ignorer.ignores(entry.path),
      directoryFilter: (entry) =>
        !ignorer.ignores(entry.path) && !isModule(entry.fullPath),
    });

    finder.on('data', (entry) => {
      promises.push(
        ...checkFile({
          deps,
          detectors,
          dir: rootDir,
          filename: entry.fullPath,
          importsMap,
          parsers,
        }),
      );
    });

    finder.on('warn', (error) => {
      debug('depcheck:checkDirectory:error')(dir, error);

      promises.push(
        Promise.resolve({
          invalidDirs: {
            [error.path]: error,
          },
        }),
      );
    });

    finder.on('end', () => {
      resolve(
        Promise.all(promises).then((results) =>
          results.reduce(
            (obj, current) => ({
              using: mergeBuckets(obj.using, current.using || {}),
              invalidFiles: Object.assign(
                obj.invalidFiles,
                current.invalidFiles,
              ),
              invalidDirs: Object.assign(obj.invalidDirs, current.invalidDirs),
            }),
            {
              using: {},
              invalidFiles: {},
              invalidDirs: {},
            },
          ),
        ),
      );
    });
  });
}

function buildResult({
  result,
  deps,
  devDeps,
  peerDeps,
  optionalDeps,
  skipMissing,
}) {
  const usingDepsLookup = lodash(result.using)
    // { f1:[d1,d2,d3], f2:[d2,d3,d4] }
    .toPairs()
    // [ [f1,[d1,d2,d3]], [f2,[d2,d3,d4]] ]
    .map(([file, dep]) => [dep, lodash.times(dep.length, () => file)])
    // [ [ [d1,d2,d3],[f1,f1,f1] ], [ [d2,d3,d4],[f2,f2,f2] ] ]
    .map((pairs) => lodash.zip(...pairs))
    // [ [ [d1,f1],[d2,f1],[d3,f1] ], [ [d2,f2],[d3,f2],[d4,f2]] ]
    .flatten()
    // [ [d1,f1], [d2,f1], [d3,f1], [d2,f2], [d3,f2], [d4,f2] ]
    .groupBy(([dep]) => dep)
    // { d1:[ [d1,f1] ], d2:[ [d2,f1],[d2,f2] ], d3:[ [d3,f1],[d3,f2] ], d4:[ [d4,f2] ] }
    .mapValues((pairs) => pairs.map(lodash.last))
    // { d1:[ f1 ], d2:[ f1,f2 ], d3:[ f1,f2 ], d4:[ f2 ] }
    .value();

  const usingDeps = Object.keys(usingDepsLookup);

  const missingDepsLookup = skipMissing
    ? []
    : (() => {
        const allDeps = deps
          .concat(devDeps)
          .concat(peerDeps)
          .concat(optionalDeps);

        const missingDeps = lodash.difference(usingDeps, allDeps);
        return lodash(missingDeps)
          .map((missingDep) => [missingDep, usingDepsLookup[missingDep]])
          .fromPairs()
          .value();
      })();

  return {
    dependencies: lodash.difference(deps, usingDeps),
    devDependencies: lodash.difference(devDeps, usingDeps),
    missing: missingDepsLookup,
    using: usingDepsLookup,
    invalidFiles: result.invalidFiles,
    invalidDirs: result.invalidDirs,
  };
}

export default ({
  rootDir,
  ignorer,
  importsMap,
  skipMissing,
  deps,
  devDeps,
  peerDeps,
  optionalDeps,
  parsers,
  detectors,
}) => {
  const allDeps = lodash.union(deps, devDeps);
  return checkDirectory({
    dir: rootDir,
    rootDir,
    ignorer,
    importsMap,
    deps: allDeps,
    parsers,
    detectors,
  }).then((result) =>
    buildResult({ result, deps, devDeps, peerDeps, optionalDeps, skipMissing }),
  );
};
