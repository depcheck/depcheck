/* global describe, it */

import should from 'should';
import path from 'path';
import { exec, spawnSync } from 'child_process';

function testE2E(module, output) {
  return new Promise(resolve => {
    const binary = path.resolve(__dirname, '../bin/depcheck');
    const modulePath = path.resolve(__dirname, 'fake_modules', module);

    exec(`node ${binary} ${modulePath}`, (error, stdout, stderr) => {
      const expectedStdOut = output.map(line => `${line}\n`).join('');

      stdout.should.equal(expectedStdOut);
      stderr.should.be.empty();

      resolve();
    });
  });
}

describe('depcheck end-to-end', () => {
  it('should find all dependencies', () =>
    testE2E('good', ['No depcheck issue']));

  it('should find unused dependencies', () =>
    testE2E('bad', ['Unused dependencies', '* optimist']));

  it('should find missing dependencies', () =>
    testE2E('missing', ['Missing dependencies', '* missing-dep']));

  it('should output error exit code when spawned', () => {
    const node = process.argv[0];
    const depcheck = path.resolve(__dirname, '../bin/depcheck');
    const cp = spawnSync(node, [depcheck, './not/exist/folder']);

    should(cp.error).be.undefined();
    cp.stderr.toString().should.containEql('/not/exist/folder').and.containEql('not exist');
    cp.status.should.not.equal(0);
  });
});
