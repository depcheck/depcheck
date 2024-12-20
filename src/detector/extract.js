// Not fond of default exports, disable here */
export function extractInlineWebpack(value) {
  const parts = value.split('!');
  if (parts.length === 1) {
    return /^https?:\/\//i.test(value)
      ? [] // ignore URLs (https://foo.bar/file.js)
      : [value]; // ['module-name'] or ['path/to/file']
  }
  if (parts[0] === '') {
    // ['', 'something-loader', 'path/to/file']
    // ignore first item
    const loaderParts = parts[1].split('?');
    if (loaderParts.length === 1) {
      return parts;
    }

    return loaderParts[0];
  }
  // ['something-loader', 'another-loader', 'path/to/file']
  return parts;
}
