import path from 'path';
import lodash from 'lodash';
import component from './component';

function constructComponent(source, name) {
  return lodash(source[name])
    .map(file => [
      file,
      require(path.resolve(__dirname, name, file)),
    ])
    .fromPairs()
    .value();
}

export const availableParsers = constructComponent(component, 'parser');

export const availableDetectors = constructComponent(component, 'detector');

export const availableSpecials = constructComponent(component, 'special');

export const defaultOptions = {
  withoutDev: false,
  ignoreBinPackage: false,
  ignoreMatches: [
  ],
  ignoreDirs: [
    '.git',
    '.svn',
    '.hg',
    '.idea',
    'node_modules',
    'bower_components',
  ],
  parsers: {
    '*.js': availableParsers.jsx,
    '*.jsx': availableParsers.jsx,
    '*.coffee': availableParsers.coffee,
    '*.litcoffee': availableParsers.coffee,
    '*.coffee.md': availableParsers.coffee,
    '*.ts': availableParsers.typescript,
    '*.tsx': availableParsers.typescript,
  },
  detectors: [
    availableDetectors.importDeclaration,
    availableDetectors.requireCallExpression,
    availableDetectors.gruntLoadTaskCallExpression,
  ],
  specials: lodash.values(availableSpecials),
};
