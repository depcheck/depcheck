/* global describe, it */

import should from 'should';
import path from 'path';
import { spawnSync } from 'child_process';

const node = process.argv[0];
const depcheck = path.resolve(__dirname, '../bin/depcheck');

function testE2E(module, output) {
  const expectedStdOut = output.map(line => `${line}\n`).join('');
  const modulePath = path.resolve(__dirname, 'fake_modules', module);
  const result = spawnSync(node, [depcheck, modulePath]);
  should(result.error).be.undefined();
  result.stdout.toString().should.equal(expectedStdOut);
  result.stderr.toString().should.be.empty();
}

describe('depcheck end-to-end', () => {
  it('should find all dependencies', () =>
    testE2E('good', ['No depcheck issue']));

  it('should find unused dependencies', () =>
    testE2E('bad', ['Unused dependencies', '* optimist']));

  it('should find missing dependencies', () =>
    testE2E('missing', ['Missing dependencies', '* missing-dep']));

  it('should output error exit code when spawned', () => {
    const result = spawnSync(node, [depcheck, './not/exist/folder']);
    should(result.error).be.undefined();
    result.stdout.toString().should.be.empty();
    result.stderr.toString().should.containEql('/not/exist/folder').and.containEql('not exist');
    result.status.should.not.equal(0);
  });
});
