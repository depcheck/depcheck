import 'should';
import parser from '../../src/special/gulp-load-plugins';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

describe('gulp-load-plugins special parser', () => {
  it('should ignore when file is not `gulpfile.js`', async () => {
    const result = await parser('/path/to/not-gulpfile.js', [], '/path/to');
    result.should.deepEqual([]);
  });

  const testCases = {
    'dependency with pattern `gulp-*`': {
      dependency: 'gulp-jshint',
      code: `
        const gulpLoadPlugins = require('gulp-load-plugins');
        const $ = gulpLoadPlugins();
        $.jshint();
      `,
    },
    'dependency with pattern `gulp.*`': {
      dependency: 'gulp.concat',
      code: `
        const $ = require('gulp-load-plugins')();
        $.concat();
      `,
    },
    'dependency with name containing multiple dash signs': {
      dependency: 'gulp-this-plugin',
      code: `
        require('gulp-load-plugins')().thisPlugin();
      `,
    },
    'scoped dependency': {
      dependency: '@scope/gulp-plugin',
      code: `
        import gulpLoadPlugins from 'gulp-load-plugins';
        const $ = gulpLoadPlugins();
        $.scope.plugin();
      `,
    },
    'dependency used in direct call': {
      dependency: 'gulp-sourcemaps',
      code: `
        const $ = require('gulp-load-plugins')();
        $.sourcemaps.init();
      `,
    },
  };

  ['gulpfile.js', 'gulpfile.babel.js'].forEach((gulpFileName) =>
    Object.keys(testCases).forEach((name) =>
      it(`should recognize ${name}`, async () => {
        const testCase = testCases[name];
        const result = await testParser(
          testCase.code,
          `/path/to/${gulpFileName}`,
          [testCase.dependency, 'gulp-load-plugins'],
          '/path/to',
        );

        result.should.deepEqual([testCase.dependency]);
      }),
    ),
  );
});
