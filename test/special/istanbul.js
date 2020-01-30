import 'should';
import parser from '../../src/special/istanbul';
import { clearCache } from '../../src/utils/get-scripts';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

describe('istanbul (nyc) special parser', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should ignore when filename is not supported', async () => {
    const result = await parser('not-supported.txt', ['unused'], __dirname);
    result.should.deepEqual([]);
  });

  [
    '.nycrc',
    '.nycrc.json',
    '.nycrc.yml',
    '.nycrc.yaml',
    'nyc.config.js',
  ].forEach((filename) => {
    it(`should recognize dependencies specified in configuration file ${filename}`, async () => {
      const content =
        '{"extends": ["simple", "@namespace/module", "sub/module", "@sub/ns/module"], "all": true}';
      const optPath = filename;
      const result = await testParser(
        content,
        optPath,
        [
          'simple',
          '@namespace/module',
          'sub',
          '@sub/ns',
          'sub/module',
          'unused',
        ],
        __dirname,
      );
      result.should.deepEqual([
        'simple',
        '@namespace/module',
        'sub',
        '@sub/ns',
      ]);
    });
  });

  it('should recognize dependencies specified in package.json configuration', async () => {
    const content = '{"nyc": {"extends": "simple", "skip-full": true}}';
    const optPath = 'package.json';
    const result = await testParser(
      content,
      optPath,
      ['simple', 'unused'],
      __dirname,
    );
    result.should.deepEqual(['simple']);
  });
});
