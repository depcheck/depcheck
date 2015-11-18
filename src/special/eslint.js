import path from 'path';

function wrapToArray(obj) {
  if (!obj) {
    return [];
  } else if (obj instanceof Array) {
    return obj;
  }

  return [obj];
}

function checkAirbnb(configs) {
  if (configs.indexOf('airbnb') !== -1) {
    return ['eslint-config-airbnb', 'eslint-plugin-react'];
  } else if (configs.indexOf('airbnb/base') !== -1 ||
             configs.indexOf('airbnb/legacy') !== -1) {
    return ['eslint-config-airbnb'];
  }

  return false;
}

export default (content, filename) => {
  const basename = path.basename(filename);
  if (basename === '.eslintrc') {
    const configs = wrapToArray(JSON.parse(content).extends);

    const airbnbResult = checkAirbnb(configs);
    if (airbnbResult) {
      return airbnbResult;
    }

    return [];
  }

  return [];
};
