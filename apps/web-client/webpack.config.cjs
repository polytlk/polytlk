const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { webpack } = require("@import-meta-env/unplugin")

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  (config, ctx) => {
    // Note: This was added by an Nx migration. Webpack builds are required to have a corresponding Webpack config file.
    // See: https://nx.dev/recipes/webpack/webpack-config-setup

    config.plugins = [
      ...config.plugins,
      webpack({
        example: `${ctx.options.projectRoot}/.env.example`,
        env: `${ctx.options.projectRoot}/.env`,
      }),
    ]

    return config;
  });
