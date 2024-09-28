const { join, resolve } = require("path");

const wpack = require('webpack')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { webpack } = require("@import-meta-env/unplugin")

require('dotenv').config()

const isDevelopment = process.env.NODE_ENV !== 'production';
const targetPlatform = process.env.TARGET_PLATFORM;
const ROOT = process.env.NX_WORKSPACE_ROOT ? `${process.env.NX_WORKSPACE_ROOT}/apps/web-client` : __dirname
const transformMode = isDevelopment
  ? (targetPlatform === "web" ? "compile-time" : "runtime")
  : "compile-time";

console.log("transformMode", transformMode)
console.log("process.env.TARGET_PLATFORM", process.env.TARGET_PLATFORM)

module.exports = {
  entry: [
    ...(isDevelopment ? ['webpack-hot-middleware/client'] : []),
    join(ROOT, 'src/main.tsx')
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
      template: join(ROOT, 'src/index.html'),
    }),
    webpack({
      example: join(ROOT, '.env.example'),
      env: join(ROOT, '.env'),
      transformMode
    }),

  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: join(ROOT, 'node_modules/.pnpm/react-virtuoso'),
        resolve: {
          fullySpecified: false, // disable the behaviour
        },
      },
      {
        test: /\.tsx?$/,
        include: join(ROOT, 'src'),
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
