/* global describe, it */

import 'should';
import gatsbySpecialParser from '../../src/special/gatsby';

const plugins = [
  'gatsby-transformer-sharp',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      path: `${__dirname}/src/img`,
      name: 'images',
    },
  },
  {
    resolve: 'gatsby-plugin-sass',
    options: {
      includePaths: ['absolute/path/a', 'absolute/path/b'],
    },
  },
  'gatsby-plugin-react-helmet',
];

describe('gatsby special parser', () => {
  it('should ignore when it is not `gatsby-config`', () => {
    const result = gatsbySpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it('should recognize the parser used by gatsby', () => {
    const content = `module.exports = { plugins : ${JSON.stringify(plugins)} }`;

    const result = gatsbySpecialParser(content, '/a/gatsby-config.js');
    result.should.deepEqual(['gatsby-transformer-sharp', 'gatsby-source-filesystem', 'gatsby-plugin-sass', 'gatsby-plugin-react-helmet']);
  });
});
