const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { webpack } = require("@import-meta-env/unplugin")

// Retrieve the target platform from environment variables
const targetPlatform = process.env.TARGET_PLATFORM;

if (!targetPlatform) {
  throw new Error('TARGET_PLATFORM environment variable is not set.');
}

const validPlatforms = ['ios', 'web'];
if (!validPlatforms.includes(targetPlatform)) {
  throw new Error(`Invalid TARGET_PLATFORM value: ${targetPlatform}. Valid values are ${validPlatforms.join(', ')}.`);
}

console.log("Building for " + targetPlatform)

const transformMode = process.env.NODE_ENV === "production"
  ? (targetPlatform === "web" ? "runtime" : "compile-time")
  : "compile-time";

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
        transformMode
      }),
    ]

    return config;
  });
