// Indexes files are compiled via `build/component.mjs`
import availableParsers from './parser';
import availableDetectors from './detector';
import availableSpecials from './special';

export { availableParsers, availableDetectors, availableSpecials };

export const defaultOptions = {
  ignoreBinPackage: false,
  ignoreMatches: [],
  ignorePatterns: [
    '.git',
    '.svn',
    '.hg',
    '.idea',
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
    '**/*.jsx': availableParsers.jsx,
    '**/*.coffee': availableParsers.coffee,
    '**/*.litcoffee': availableParsers.coffee,
    '**/*.coffee.md': availableParsers.coffee,
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
  specials: Object.values(availableSpecials),
};
