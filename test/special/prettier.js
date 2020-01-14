import 'should';
import path from 'path';
import parser from '../../src/special/prettier';

async function testPrettier(moduleName, fileName, expectedDeps) {
  const rootDir = path.resolve(__dirname, '../fake_modules', moduleName);
  const deps = ['dummy', '@company/prettier-config'];
  const result = await parser(path.resolve(rootDir, fileName), deps, rootDir);
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
