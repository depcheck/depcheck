/* global describe, it */

import 'should';
import path from 'path';
import http from 'http';
import cli from '../src/cli';

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer();
    server.listen(54964, () => resolve(server));
  });
}

function runCli(server, env) {
  return new Promise(resolve => {
    let req = null;
    const logs = [];
    const errors = [];
    const goodModule = path.resolve(__dirname, 'fake_modules/good');
    const baseUrl = `http://localhost:${server.address().port}`;

    server.on('request', (request, res) => {
      req = request;
      res.end();
    });

    cli(
      [goodModule, '--web-report', '--web-service', baseUrl],
      env,
      data => logs.push(data),
      data => errors.push(data),
      exitCode =>
        server.close(() => resolve({
          req,
          logs,
          errors,
          exitCode,
        })));
  });
}

function testWebReport(env) {
  return startServer().then(server => runCli(server, env));
}

describe('depcheck web-report', () => {
  it('should post web report in Travis CI environment', () =>
    testWebReport({
      TRAVIS: 'true',
      TRAVIS_REPO_SLUG: 'lijunle/depcheck-es6',
      TRAVIS_PULL_REQUEST: 'false',
    })
    .then(actual => {
      actual.req.url.should.equal('/github/lijunle/depcheck-es6');
      actual.exitCode.should.equal(0);
      actual.errors.should.have.length(0);
      actual.logs.should.deepEqual([
        'No unused dependencies',
        'Post web report succeed.',
      ]);
    }));

  it('should not post web report if triggered by a pull request', () =>
    testWebReport({
      TRAVIS: 'true',
      TRAVIS_REPO_SLUG: 'lijunle/depcheck-es6',
      TRAVIS_PULL_REQUEST: '123',
    })
    .then(actual => {
      actual.should.have.property('req', null); // because no request is sent
      actual.exitCode.should.equal(0);
      actual.errors.should.have.length(0);
      actual.logs.should.deepEqual([
        'No unused dependencies',
        'Skip posting depcheck report to web service because it run in a pull request.',
      ]);
    }));
});
