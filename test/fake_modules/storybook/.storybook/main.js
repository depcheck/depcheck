module.exports = {
  framework: '@storybook/react',
  stories: [
    '../src/**/*.stories.@(js|ts|jsx|tsx|mdx)',
    '../packages/**/src/**/*.stories.@(js|ts|jsx|tsx|mdx)',
  ],
  features: {},
  addons: ['@storybook/addon-essentials', '@storybook/addon-links'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'none',
    reactDocgenTypescriptOptions: {},
  },
  core: {
    builder: 'webpack5',
  },
  reactOptions: {
    fastRefresh: true,
  },
};
