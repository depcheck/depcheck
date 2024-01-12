import 'should';
import parseTslib from '../../src/special/tslib';
import { getTestParserWithContentPromise } from '../utils';

describe('tslib special parser', () => {
  const testParser = getTestParserWithContentPromise(parseTslib);

  it('should ignore when filename is not supported', async () => {
    const content = JSON.stringify({
      compilerOptions: {
        importHelpers: true,
      },
    });
    const deps = await testParser(content, 'not-supported.txt');
    deps.should.deepEqual([]);
  });

  it('should ignore when file is not a valid JSON', async () => {
    const content = 'not a valid JSON';
    const deps = await testParser(content, 'tsconfig.json');
    deps.should.deepEqual([]);
  });

  it('should ignore when file is not a valid tsconfig', async () => {
    const content = JSON.stringify({
      foo: 'bar',
    });
    const deps = await testParser(content, 'tsconfig.json');
    deps.should.deepEqual([]);
  });

  it('should pass when file is a valid tsconfig', async () => {
    const content = JSON.stringify({
      compilerOptions: {
        importHelpers: true,
      },
    });
    const deps = await testParser(content, 'tsconfig.json');
    deps.should.deepEqual(['tslib']);
  });

  it('should pass with other tsconfig', async () => {
    const content = JSON.stringify({
      compilerOptions: {
        importHelpers: true,
      },
    });
    const deps = await testParser(content, 'tsconfig.build.json');
    deps.should.deepEqual(['tslib']);
  });

  it('should pass when not using ImportHelpers', async () => {
    const content = JSON.stringify({
      compilerOptions: {
        importHelpers: false,
      },
    });
    const deps = await testParser(content, 'tsconfig.json');
    deps.should.deepEqual([]);
  });
});
