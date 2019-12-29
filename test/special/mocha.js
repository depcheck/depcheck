import 'should';
import fs from 'fs';
import path from 'path';
import parse from '../../src/special/mocha';
import { clearCache } from '../../src/utils/get-scripts';

describe('mocha special parser', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should recognize dependencies used in default mocha options', () => {
    const content = ['--require chai', '--ui bdd', '--reporter spec'].join(
      '\n',
    );
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse(content, optPath, ['chai', 'unused'], __dirname);
    result.should.deepEqual(['chai']);
  });

  it('should recognize dependencies path-module used in mocha options', () => {
    const content = [
      '--require chai/path/to/module',
      '--ui bdd',
      '--reporter spec',
    ].join('\n');
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse(content, optPath, ['chai', 'unused'], __dirname);
    result.should.deepEqual(['chai']);
  });

  it('should recognize mocha options specified from scripts', () => {
    const rootDir = path.resolve(__dirname, '../fake_modules/mocha_opts');
    const packagePath = path.resolve(rootDir, 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const dependencies = Object.keys(
      JSON.parse(packageContent).devDependencies,
    );
    const result = parse(packageContent, packagePath, dependencies, rootDir);
    result.should.deepEqual(['babel', 'chai']);
  });

  it('should recognise requires from scripts', () => {
    const result = parse(
      `{
      "scripts": {
        "test": "mocha --require chai --require chai/index *"
      }
    }`,
      path.resolve(__dirname, 'package.json'),
      ['chai'],
      __dirname,
    );
    result.should.deepEqual(['chai']);
  });

  it('should recognise reporters from scripts', () => {
    const result = parse(
      `{
      "scripts": {
        "test": "mocha --reporter custom-reporter *"
      }
    }`,
      path.resolve(__dirname, 'package.json'),
      ['custom-reporter'],
      __dirname,
    );
    result.should.deepEqual(['custom-reporter']);
  });

  it('should recognise requires from complex scripts', () => {
    const result = parse(
      `{
      "scripts": {
        "test": "someci command --require ignoreme && mocha --require chai *"
      }
    }`,
      path.resolve(__dirname, 'package.json'),
      ['chai'],
      __dirname,
    );
    result.should.deepEqual(['chai']);
  });

  it('should recognise reporters from opts', () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse('--reporter foo-bar', optPath, ['foo-bar'], __dirname);
    result.should.deepEqual(['foo-bar']);
  });

  it('should ignore invalid flags', () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse(
      '--reporter --require --reporter',
      optPath,
      [],
      __dirname,
    );
    result.should.deepEqual([]);
  });

  it('should ignore opts flag', () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse('--opts', optPath, [], __dirname);
    result.should.deepEqual([]);
  });

  [
    'dot',
    'doc',
    'tap',
    'json',
    'html',
    'list',
    'min',
    'spec',
    'nyan',
    'xunit',
    'markdown',
    'progress',
    'landing',
    'json-stream',
  ].forEach((reporter) => {
    it(`should ignore built-in reporters (${reporter})`, () => {
      const optPath = path.resolve(__dirname, 'test/mocha.opts');
      const result = parse(`--reporter ${reporter}`, optPath, [], __dirname);
      result.should.deepEqual([]);
    });
  });
});
