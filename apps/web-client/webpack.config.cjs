const { join, resolve } = require("path");

const wpack = require('webpack')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { webpack } = require("@import-meta-env/unplugin")


const isDevelopment = process.env.NODE_ENV !== 'production';
const targetPlatform = process.env.TARGET_PLATFORM;
const NX_ROOT = process.env.NX_WORKSPACE_ROOT

const transformMode = isDevelopment
  ? (targetPlatform === "web" ? "compile-time" : "runtime")
  : "compile-time";

module.exports = {
  entry: [
    ...(isDevelopment ? ['webpack-hot-middleware/client'] : []),
    join(NX_ROOT, 'apps/web-client/src/main.tsx')
  ],
  mode: isDevelopment ? 'development' : 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin({ logLevel: "info", configFile: join(__dirname, 'tsconfig.json') })]
  },
  output: {
    filename: 'bundle.[fullhash].js',
    path: resolve(__dirname, 'dist'),
    publicPath: "/"
  },
  plugins: [
    isDevelopment && new wpack.HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin({
      overlay: {
        sockIntegration: 'whm',
      },
    }),
    //isDevelopment && new ForkTsCheckerWebpackPlugin({
    //  typescript: {
    //    diagnosticOptions: {
    //      semantic: true,
    //      syntactic: true,
    //    },
    //    mode: 'write-references',
    //  },
    //}),
    new HtmlWebpackPlugin({
      template: join(NX_ROOT, 'apps/web-client/src/index.html'),
    }),
    webpack({
      example: join(NX_ROOT, 'apps/web-client/.env.example'),
      env: join(NX_ROOT, 'apps/web-client/.env'),
      transformMode
    }),

  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: join(NX_ROOT, 'libs'),
        use: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        include: join(NX_ROOT, 'apps/web-client/src'),
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
