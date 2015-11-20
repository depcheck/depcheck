import path from 'path';

export default function discoverPeerDep(depName, rootDir) {
  try {
    const file = path.resolve(rootDir, 'node_modules', depName, 'package.json');
    const metadata = require(file);
    const peerDeps = Object.keys(metadata.peerDependencies || {});
    return peerDeps;
  } catch (error) {
    return [];
  }
}
