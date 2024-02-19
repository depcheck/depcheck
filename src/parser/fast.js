import path from 'path';
import { depseek } from 'depseek';
import findup from 'findup-sync';
import isCore from 'is-core-module';
import { resolve as resolveImports } from 'resolve.imports';
import { getContent } from '../utils/file';

const extractPkgName = (value) => {
  const [o, n] = value.split('/');
  return o[0] === '@' ? `${o}/${n}` : o;
};

export default async function fastParser(filename) {
  const content = await getContent(filename);
  const { dependencies = {}, devDependencies = {}, imports } = JSON.parse(
    await getContent(findup('package.json', { cwd: path.dirname(filename) })),
  );
  const importsManifest = {
    content: {
      imports,
    },
  };

  let prev = 0;
  const deps = (await depseek(content)).reduce(
    (m, { type, value, index }) => {
      if (type === 'dep' && value[0] !== '.' && value[0] !== '/') {
        const [v] = value.split('?');
        const bucket = content.slice(prev, index).includes('import type')
          ? m.types
          : m.runtime;

        if (/^(https?|file):/i.test(v)) {
          /* noop */
        } else if (v.includes('!')) {
          bucket.push(...v.split('!').filter(Boolean).map(extractPkgName));
        } else if (v[0] === '#') {
          const typeref = resolveImports(importsManifest, v, {
            conditions: ['types'],
          });
          const ref = resolveImports(importsManifest, v, {
            conditions: ['node', 'require', 'import', 'default', 'test'],
          });

          if (typeref) m.types.push(extractPkgName(typeref));
          if (ref) bucket.push(extractPkgName(ref));
        } else {
          bucket.push(extractPkgName(v));
        }

        prev = index;
      }
      return m;
    },
    {
      runtime: [],
      types: [],
    },
  );

  console.log('!!!!', deps)
  const maybeTypeDeps = Object.values(deps)
    .flat()
    .map((dep) => {
      if (isCore(dep)) return '@types/node';
      if (dep.startsWith('@types/')) return dep;

      const chunks = dep.split('/');
      return dep[0] === '@'
        ? `@types/${chunks[0].slice(1)}__${chunks[1]}`
        : `@types/${chunks[0]}`;
    });

  const typeDeps = maybeTypeDeps.filter(
    (dep) => dependencies[dep] || devDependencies[dep],
  );
  return [...new Set([...deps.runtime, ...typeDeps])];
}
