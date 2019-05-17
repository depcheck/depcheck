import 'should';
import path from 'path';
import fse from 'fs-extra';
import jestSpecialParser from '../../src/special/jest';

const configFileNames = [
  'jest.config.js',
  'jest.conf.js',
  'jest.config.json',
  'jest.conf.json',
];

const testCases = [
  {
    name: 'ignore when the config is the empty object',
    content: {},
    deps: [],
  },
  {
    name: 'recognize single short-name vue runner',
    content: { runner: 'mocha' },
    deps: ['jest-runner-mocha'],
  },
];

function random() {
  return Math.random().toString().substring(2);
}

async function getTempPath(filename, content) {
  const tempFolder = path.resolve(__dirname, `tmp-${random()}`);
  const tempPath = path.resolve(tempFolder, filename);
  await fse.ensureDir(tempFolder);
  await fse.outputFile(tempPath, content);
  return tempPath;
}

async function removeTempFile(filepath) {
  const fileFolder = path.dirname(filepath);
  await fse.remove(filepath);
  await fse.remove(fileFolder);
}

async function testJest(content, deps, expectedDeps, filename) {
  const tempPath = await getTempPath(
    (filename || configFileNames[0]),
    content,
  );
  try {
    const result = jestSpecialParser(content, tempPath, deps, __dirname);
    Array.from(result).should.deepEqual(expectedDeps);
  } finally {
    await removeTempFile(tempPath);
  }
}

describe.only('jest special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = jestSpecialParser('content', 'jest.js', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should handle JSON parse error', () => {
    const content = '{ this is an invalid JSON string';
    return testJest(content, [], []);
  });

  it('should handle parse error for valid JS but invalid JSON', () => {
    const content = 'module.exports = function() {}';
    return testJest(content, [], []);
  });

  it('should ignore unsupported config properties', () => {
    const content = `module.exports = ${{ unsupported: 'npm-module' }}`;
    return testJest(content, [], []);
  });

  it('should recognize unused dependencies in jest config', () => {
    const config = JSON.stringify(testCases[1].content);
    const content = `module.exports = ${config}`;
    const deps = testCases[1].deps.concat(['unused-module']);
    return testJest(content, deps, testCases[1].deps);
  });

  it('should handle require call to other modules', () => {
    const config = JSON.stringify(testCases[1].content);
    const content = `const fs = require('fs');
      module.exports = ${config}`;
    return testJest(content, testCases[1].deps, testCases[1].deps);
  });

  configFileNames.forEach(fileName => (
    testCases.forEach(testCase => (
      it(`should ${testCase.name} in config file ${fileName}`, () => {
        const config = JSON.stringify(testCase.content);
        let content = config;
        if (fileName.split('.').pop() === 'js')
          content = `module.exports = ${config}`;
        return testJest(content, testCase.deps, testCase.deps, fileName);
      })
    ))
  ));
});