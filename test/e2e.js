/* global describe, it */

import 'should';
import path from 'path';
import { exec } from 'child_process';

function testE2E(module, output) {
  return new Promise(resolve => {
    const binary = path.resolve(__dirname, '../bin/depcheck');
    const modulePath = path.resolve(__dirname, 'fake_modules', module);

    exec(`node ${binary} ${modulePath}`, (error, stdout, stderr) => {
      const expectedStdOut = output.map(line => line + '\n').join('');

      stdout.should.equal(expectedStdOut);
      stderr.should.be.empty();

      resolve();
    });
  });
}

describe('depcheck end-to-end', () => {
  it('should find all dependencies', () =>
    testE2E('good', ['No unused dependencies']));

  it('should find unused dependencies', () =>
    testE2E('bad', ['Unused Dependencies', '* optimist']));
});
