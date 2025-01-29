import path from 'path';
import lodash from 'lodash';
import component from './component.json';

function constructComponent(source, name) {
  return lodash(source[name])
    .map((file) => [
      file,
      require(path.resolve(__dirname, name, file)), // eslint-disable-line global-require
    ])
    .fromPairs()
    .value();
}

export const availableParsers = constructComponent(component, 'parser');

export const availableDetectors = constructComponent(component, 'detector');

export const availableSpecials = constructComponent(component, 'special');

export const defaultOptions = {
  ignoreBinPackage: false,
  ignoreMatches: [],
  ignorePatterns: [
    '.git',
    '.svn',
    '.hg',
    '.idea',
    '.yarn',
    'node_modules',
    'bower_components',
    // Images
    '*.png',
    '*.gif',
    '*.jpg',
    '*.jpeg',
    '*.svg',
    // Fonts
    '*.woff',
    '*.woff2',
    '*.eot',
    '*.ttf',
    // Archives
    '*.zip',
    '*.gz',
    // Videos
    '*.mp4',
  ],
  skipMissing: false,
  parsers: {
    '**/*.js': availableParsers.jsx,
    '**/*.mjs': availableParsers.jsx,
    '**/*.cjs': availableParsers.jsx,
    '**/*.jsx': availableParsers.jsx,
    '**/*.coffee': availableParsers.coffee,
    '**/*.litcoffee': availableParsers.coffee,
    '**/*.coffee.md': availableParsers.coffee,
    '**/*.graphql': availableParsers.graphql,
    '**/.storybook/main.js': availableParsers.storybook,
    '**/tsconfig*.json': availableParsers.tsconfig,
    '**/*.cts': availableParsers.typescript,
    '**/*.mts': availableParsers.typescript,
    '**/*.ts': availableParsers.typescript,
    '**/*.tsx': availableParsers.typescript,
    '**/*.sass': availableParsers.sass,
    '**/*.scss': availableParsers.sass,
    '**/*.vue': availableParsers.vue,
    '**/*.svelte': availableParsers.svelte,
  },
  detectors: [
    availableDetectors.importDeclaration,
    availableDetectors.exportDeclaration,
    availableDetectors.requireCallExpression,
    availableDetectors.requireResolveCallExpression,
    availableDetectors.typescriptImportEqualsDeclaration,
    availableDetectors.importCallExpression,
    availableDetectors.gruntLoadTaskCallExpression,
  ],
  specials: lodash.values(availableSpecials),
};
