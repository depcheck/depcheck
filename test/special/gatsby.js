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

  it('should recognize nested dependencies', async () => {
    const resolvePlugins = [
      {
        resolve: 'gatsby-plugin-page-creator',
        options: {
          plugins: [
            {
              resolve: 'gatsby-remark-relative-images',
              options: {
                name: 'uploads',
              },
            },
          ],
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
      'gatsby-remark-relative-images',
    ]);
  });

  it('should recognize template literals', async () => {
    const content =
      'module.exports = {\n' +
      '  plugins : [\n' +
      '    {\n' +
      '      resolve: `gatsby-plugin-page-creator`,' +
      '      options: {\n' +
      '        plugins: [\n' +
      '          {\n' +
      '            resolve: `gatsby-remark-relative-images`,\n' +
      '            options: {\n' +
      '              name: "uploads",\n' +
      '            },\n' +
      '          },\n' +
      '        ],\n' +
      '      },\n' +
      '    },\n' +
      '    `gatsby-plugin-react-helmet`,\n' +
      '    "gatsby-plugin-catch-links",\n' +
      '  ],' +
      '}';

    const result = await testParser(content, '/a/gatsby-config.js');
    result.should.deepEqual([
      'gatsby-plugin-page-creator',
      'gatsby-plugin-react-helmet',
      'gatsby-plugin-catch-links',
      'gatsby-remark-relative-images',
    ]);
  });
});
