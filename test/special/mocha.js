import 'should';
import fs from 'fs';
import path from 'path';
import parser from '../../src/special/mocha';
import { clearCache } from '../../src/utils/get-scripts';
import {
  getTestParserWithTempFile,
  getTestParserWithContentPromise,
} from '../utils';

const testParser = getTestParserWithContentPromise(parser);
const testParserTempFile = getTestParserWithTempFile(parser);

describe('mocha special parser', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should ignore when filename is not supported', async () => {
    const result = await parser('not-supported.txt', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should recognize dependencies used in default mocha options', async () => {
    const content = ['--require chai', '--ui bdd', '--reporter spec'].join(
      '\n',
    );
    const optPath = path.resolve(__dirname, 'test/mocha.opts');

    const result = await testParser(
      content,
      optPath,
      ['chai', 'unused'],
      __dirname,
    );
    result.should.deepEqual(['chai']);
  });

  it('should recognize @types/mocha as used dependency', async () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = await parser(optPath, ['@types/mocha', 'unused'], __dirname);
    result.should.deepEqual(['@types/mocha']);
  });

  it('should recognize dependencies path-module used in mocha options', async () => {
    const content = [
      '--require chai/path/to/module',
      '--ui bdd',
      '--reporter spec',
    ].join('\n');
    const optPath = path.resolve(__dirname, 'test/mocha.opts');

    const result = await testParser(
      content,
      optPath,
      ['chai', 'unused'],
      __dirname,
    );
    result.should.deepEqual(['chai']);
  });

  [
    '.mocharc.json',
    '.mocharc.jsonc',
    '.mocharc.js',
    '.mocharc.yml',
    '.mocharc.yaml',
  ].forEach((filename) => {
    it(`should recognize dependencies specified in configuration file ${filename}`, async () => {
      const content =
        '{"require": "chai","reporter": ["list", "custom-reporter"]}';

      const result = await testParserTempFile(
        content,
        filename,
        ['chai', 'list', 'custom-reporter', 'unused'],
        __dirname,
      );
      result.should.deepEqual(['chai', 'custom-reporter']);
    });
  });

  it('should recognize dependencies specified in package.json configuration', async () => {
    const content =
      '{"mocha": {"require": ["chai"],"reporter": ["list", "custom-reporter"]}}';
    const optPath = 'package.json';

    const result = await testParserTempFile(
      content,
      optPath,
      ['chai', 'list', 'custom-reporter', 'unused'],
      __dirname,
    );
    result.should.deepEqual(['chai', 'custom-reporter']);
  });

  it('should recognize mocha options specified from scripts', async () => {
    const rootDir = path.resolve(__dirname, '../fake_modules/mocha_opts');
    const packagePath = path.resolve(rootDir, 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const dependencies = Object.keys(
      JSON.parse(packageContent).devDependencies,
    );

    const result = await parser(packagePath, dependencies, rootDir);
    result.should.deepEqual(['babel', 'chai']);
  });

  it('should recognize mocha configuration specified from scripts', async () => {
    const rootDir = path.resolve(__dirname, '../fake_modules/mocha_config');
    const packagePath = path.resolve(rootDir, 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const dependencies = Object.keys(
      JSON.parse(packageContent).devDependencies,
    );

    const result = await parser(packagePath, dependencies, rootDir);
    result.should.deepEqual(['babel', 'chai']);
  });

  it('should recognise requires from scripts', async () => {
    const content = `{
      "scripts": {
        "test": "mocha --require chai --require chai/index *"
      }
    }`;

    const result = await testParser(
      content,
      'package.json',
      ['chai'],
      __dirname,
    );
    result.should.deepEqual(['chai']);
  });

  it('should recognise reporters from scripts', async () => {
    const content = `{
      "scripts": {
        "test": "mocha --reporter custom-reporter *"
      }
    }`;

    const result = await testParser(
      content,
      'package.json',
      ['custom-reporter'],
      __dirname,
    );
    result.should.deepEqual(['custom-reporter']);
  });

  it('should recognise requires from complex scripts', async () => {
    const content = `{
      "scripts": {
        "test": "someci command --require ignoreme && mocha --require chai *"
      }
    }`;

    const result = await testParser(
      content,
      'package.json',
      ['chai'],
      __dirname,
    );
    result.should.deepEqual(['chai']);
  });

  it('should recognise reporters from opts', async () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');

    const result = await testParser(
      '--reporter foo-bar',
      optPath,
      ['foo-bar'],
      __dirname,
    );
    result.should.deepEqual(['foo-bar']);
  });

  it('should ignore invalid flags', async () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');

    const result = await testParser(
      '--reporter --require --reporter',
      optPath,
      [],
      __dirname,
    );
    result.should.deepEqual([]);
  });

  it('should ignore opts flag', async () => {
    const optPath = path.resolve(__dirname, 'test/mocha.opts');

    const result = await testParser('--opts', optPath, [], __dirname);
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
    it(`should ignore built-in reporters (${reporter})`, async () => {
      const optPath = path.resolve(__dirname, 'test/mocha.opts');

      const result = await testParser(
        `--reporter ${reporter}`,
        optPath,
        [],
        __dirname,
      );
      result.should.deepEqual([]);
    });
  });
});
