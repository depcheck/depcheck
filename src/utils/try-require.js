export default function tryRequire(module) {
  try {
    return require(module); // eslint-disable-line global-require
  } catch (e) {
    return null;
  }
}
