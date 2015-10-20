import request from 'request';

export default function postWebReport(result, log, error, env, { webReport, webService }) {
  // TODO this web report feature only support Travis CI and GitHub now
  return webReport === undefined || env.TRAVIS !== 'true'
  ? Promise.resolve(result)
  : new Promise(resolve =>
    request({
      baseUrl: webService,
      url: `/github/${env.TRAVIS_REPO_SLUG}`,
      method: 'POST',
      json: true,
      body: {
        token: env.DEPCHECK_TOKEN,
        branch: env.TRAVIS_BRANCH,
        report: webReport,
        result,
      },
    }, (err, res, body) => {
      if (err) {
        error(err.toString());
      } else if (res.statusCode !== 200) {
        error(body);
      } else {
        log('Post web report succeed.');
      }

      resolve(result);
    }));
}
