import 'should';
import path from 'path';
import parse from '../../src/special/istanbul';
import { clearCache } from '../../src/utils/get-scripts';

describe('istanbul (nyc) special parser', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should ignore when filename is not supported', () => {
    const result = parse('content', 'not-supported.txt', ['unused'], __dirname);
    result.should.deepEqual([]);
  });

  [
    '.nycrc',
    '.nycrc.json',
    '.nycrc.yml',
    '.nycrc.yaml',
    'nyc.config.js',
  ].forEach((filename) => {
    it(`should recognize dependencies specified in configuration file ${filename}`, () => {
      const content =
        '{"extends": ["simple", "@namespace/module", "sub/module", "@sub/ns/module"], "all": true}';
      const optPath = path.resolve(__dirname, filename);
      const result = parse(
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

  it('should recognize dependencies specified in package.json configuration', () => {
    const content = '{"nyc": {"extends": "simple", "skip-full": true}}';
    const optPath = path.resolve(__dirname, 'package.json');
    const result = parse(content, optPath, ['simple', 'unused'], __dirname);
    result.should.deepEqual(['simple']);
  });
});
