const nextConfig = {
  webpack: (config, { webpack }) => {
    config.plugins.push(new webpack.InvalidPLugin());

    return config;
  },
};

module.exports = nextConfig;
