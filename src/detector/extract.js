// Not fond of default exports, disable here */
/* eslint import/prefer-default-export: off */
export function extractInlineWebpack(value) {
  const parts = value.split('!');
  if (parts.length === 1) {
    return [value]; // ['module-name'] or ['path/to/file']
  }
  if (parts[0] === '') {
    // ['', 'something-loader', 'path/to/file']
    // ignore first item
    return parts.slice(1);
  }
  // ['something-loader', 'another-loader', 'path/to/file']
  return parts;
}
