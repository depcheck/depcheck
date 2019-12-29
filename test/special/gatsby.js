import 'should';
import gatsbySpecialParser from '../../src/special/gatsby';

const plugins = ['gatsby-plugin-sass', 'gatsby-plugin-react-helmet'];

describe('gatsby special parser', () => {
  it('should ignore when it is not `gatsby-config`', () => {
    const result = gatsbySpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it('should recognize the parser used by gatsby', () => {
    const content = `module.exports = { plugins : ${JSON.stringify(plugins)} }`;

    const result = gatsbySpecialParser(content, '/a/gatsby-config.js');
    result.should.deepEqual([
      'gatsby-plugin-sass',
      'gatsby-plugin-react-helmet',
    ]);
  });
});
