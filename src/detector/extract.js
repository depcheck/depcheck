// Not fond of default exports, disable here */
/* eslint import/prefer-default-export: off */
export function extractInlineWebpack(value) {
  const parts = value.split('!');
  if (parts.length === 1) {
    return value;
  }

  return parts.pop();
}
