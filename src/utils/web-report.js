import request from 'request';

function getSettings(env) {
  // TODO web report only supports Travis CI and GitHub now
  if (env.TRAVIS === 'true') {
    return {
      url: `/github/${env.TRAVIS_REPO_SLUG}`,
      branch: env.TRAVIS_BRANCH,
    };
  }

  return {};
}

export default function postWebReport(
  result, log, error, env, { webReport, webService }) {
  if (webReport === undefined) {
    return Promise.resolve(result);
  }

  const { url, branch } = getSettings(env);
  if (!url) {
    error('Build environment is not supported yet, please report issue to https://github.com/lijunle/depcheck-es6');
    return Promise.resolve(result);
  }

  return new Promise(resolve =>
    request({
      baseUrl: webService,
      url,
      method: 'POST',
      json: true,
      body: {
        token: env.DEPCHECK_TOKEN,
        branch,
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
