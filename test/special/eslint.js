/* global describe, it */

import 'should';
import eslintSpecialParser from '../../src/special/eslint';

describe('eslint special parser', () => {
  it('should ignore when filename is not `.eslintrc`', () => {
    const result = eslintSpecialParser('content', '/a/file');
    result.should.deepEqual([]);
  });

  it('should ignore when user not extends any config in `.eslintrc`', () => {
    const content = JSON.stringify({});
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');

    result.should.have.length(0);
  });

  it('should ignore when `airbnb` is not used `.eslintrc`', () => {
    const content = JSON.stringify({ extends: 'others' });
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');

    result.should.have.length(0);
  });

  it('should handle the `airbnb` config', () => {
    const content = JSON.stringify({ extends: 'airbnb' });
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');

    result.should.have.length(2);
    result.should.containEql('eslint-config-airbnb');
    result.should.containEql('eslint-plugin-react');
  });

  it('should handle the `airbnb/base` config', () => {
    const content = JSON.stringify({ extends: 'airbnb/base' });
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');

    result.should.have.length(1);
    result.should.containEql('eslint-config-airbnb');
  });

  it('should handle the `airbnb/legacy` config', () => {
    const content = JSON.stringify({ extends: 'airbnb/legacy' });
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');

    result.should.have.length(1);
    result.should.containEql('eslint-config-airbnb');
  });

  it('should detect `airbnb` even multiple configs are used', () => {
    const content = JSON.stringify({ extends: ['airbnb', 'others'] });
    const result = eslintSpecialParser(content, '/path/to/.eslintrc');

    result.should.have.length(2);
  });
});
