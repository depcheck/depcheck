import jsxFail from 'jsx-fail';

export const myFunc = async (
  options: Record<string, unknown>,
): Promise<string[]> => {
  if (options['hosts']?.['length']) {
    return <string[]>options['hosts'];
  }
};
