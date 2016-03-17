export default function tryRequire(module) {
  try {
    return require(module);
  } catch (e) {
    return null;
  }
}
