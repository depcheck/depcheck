/* global describe, it */

import 'should';
import fs from 'fs';
import path from 'path';
import parse from '../../src/special/package';

describe('package.json special parser', () => {
  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', [], __dirname);
    result.should.deepEqual([]);
  });

  it('should recognize mocha options specified from scripts', () => {
    const rootDir = path.resolve(__dirname, '../fake_modules/package_json_scripts');
    const packagePath = path.resolve(rootDir, 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const dependencies = Object.keys(JSON.parse(packageContent).dependencies);
    const result = parse(packageContent, packagePath, dependencies, rootDir);
    result.should.deepEqual(['ts-node']);
  });

  it('should not fail to parse package.json when the scripts key is missing', () => {
    const rootDir = path.resolve(__dirname, '../fake_modules/package_json_no_scripts');
    const packagePath = path.resolve(rootDir, 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const dependencies = Object.keys(JSON.parse(packageContent).dependencies);
    const result = parse(packageContent, packagePath, dependencies, rootDir);
    result.should.deepEqual([]);
  });
});
