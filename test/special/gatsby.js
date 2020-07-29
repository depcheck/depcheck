import 'should';
import parser from '../../src/special/gatsby';
import { getTestParserWithContentPromise } from '../utils';

const testParser = getTestParserWithContentPromise(parser);

const plugins = ['gatsby-plugin-sass', 'gatsby-plugin-react-helmet'];

describe('gatsby special parser', () => {
  it('should ignore when it is not `gatsby-config`', async () => {
    const result = await parser('/a/file');
    result.should.deepEqual([]);
  });

  it('should recognize the parser used by gatsby', async () => {
    const content = `module.exports = { plugins : ${JSON.stringify(plugins)} }`;

    const result = await testParser(content, '/a/gatsby-config.js');
    result.should.deepEqual([
      'gatsby-plugin-sass',
      'gatsby-plugin-react-helmet',
    ]);
  });

  it('should recognize resolve dependencies', async () => {
    const resolvePlugins = [
      {
        resolve: 'gatsby-plugin-page-creator',
        options: {
          path: `${__dirname}/frontend/pages`,
        },
      },
      'gatsby-plugin-react-helmet',
      'gatsby-plugin-catch-links',
    ];

    const content = `module.exports = { plugins : ${JSON.stringify(
      resolvePlugins,
    )} }`;

    const result = await testParser(content, '/a/gatsby-config.js');
    result.should.deepEqual([
      'gatsby-plugin-page-creator',
      'gatsby-plugin-react-helmet',
      'gatsby-plugin-catch-links',
    ]);
  });
});
