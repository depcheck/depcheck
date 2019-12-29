import 'should';
import fs from 'fs';
import path from 'path';
import parse from '../../src/special/prettier';

function testPrettier(moduleName, fileName, expectedDeps) {
  const rootDir = path.resolve(__dirname, '../fake_modules', moduleName);
  const content = fs.readFileSync(
    path.resolve(rootDir, 'package.json'),
    'utf8',
  );
  const deps = ['dummy', '@company/prettier-config'];
  const result = parse(content, path.resolve(rootDir, fileName), deps, rootDir);
  Array.from(result).should.deepEqual(expectedDeps);
}

describe('prettier special parser', () => {
  it('should ignore when filename is not supported', () => {
    return testPrettier('prettier', 'not-supported.txt', []);
  });

  it('should not find anything if no prettier entry', () => {
    return testPrettier('good', 'package.json', []);
  });

  it('should find prettier dependency if defined', () => {
    return testPrettier('prettier', 'package.json', [
      '@company/prettier-config',
    ]);
  });
});
