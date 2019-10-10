/* global describe, it */

import 'should';
import gatsbySpecialParser from '../../src/special/gatsby';

describe('gatsby special parser', () => {
  it('should ignore when it is not `gatsby-config`', () => {
    const result = gatsbySpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it('should recognize the parser used by gatsby', () => {
    const content = 'module.exports = { plugins : [ "gatsby-transformer-sharp" ] }';

    const result = gatsbySpecialParser(content, '/a/gatsby-config.js');
    result.should.deepEqual(['gatsby-transformer-sharp']);
  });

  it('should recognize string literals', () => {
    const result = gatsbySpecialParser(`module.exports = {
      plugins: [
        'gatsby-transformer-sharp',
        "gatsby-plugin-typescript",
        'gatsby-plugin-react-helmet',
      ]
    }`, '/a/gatsby-config.js');
    result.should.deepEqual(['gatsby-transformer-sharp', 'gatsby-plugin-typescript', 'gatsby-plugin-react-helmet']);
  });

  it('should recognize configuration objects', () => {
    const result = gatsbySpecialParser(`module.exports = {
      plugins: [
        {
          resolve: 'gatsby-transformer-sharp'
        },
        {
          'resolve': "gatsby-plugin-typescript"
        },
        {
          "resolve": "gatsby-plugin-react-helmet"
        },
      ],
    }`, '/a/gatsby-config.js');
    result.should.deepEqual(['gatsby-transformer-sharp', 'gatsby-plugin-typescript', 'gatsby-plugin-react-helmet']);
  });
});
