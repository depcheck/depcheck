/* global describe, it */

import 'should';
import fs from 'fs';
import path from 'path';
import parse from '../../src/special/mocha';

describe('mocha special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should recognize unused dependencies in default mocha options', () => {
    const content = ['--require chai', '--ui bdd', '--reporter spec'].join('\n');
    const optPath = path.resolve(__dirname, 'test/mocha.opts');
    const result = parse(content, optPath, ['chai', 'unused'], __dirname);
    result.should.deepEqual(['chai']);
  });

  it('should recognize mocha options specified from scripts', () => {
    const rootDir = path.resolve(__dirname, '../fake_modules/mocha_opts');
    const packagePath = path.resolve(rootDir, 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const dependencies = Object.keys(JSON.parse(packageContent).devDependencies);
    const result = parse(packageContent, packagePath, dependencies, rootDir);
    result.should.deepEqual(['babel', 'chai']);
  });
});
