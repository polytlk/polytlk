const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const history = require('connect-history-api-fallback')

const config = require('../webpack.config.cjs');

const compiler = webpack(config);

const devMiddleware = webpackDevMiddleware(compiler, {
  writeToDisk: false,
  publicPath: config.output.publicPath,
});

const hotMiddleware = webpackHotMiddleware(compiler, {
  path: `/__webpack_hmr`,
  heartbeat: 10 * 1000,
});

const historyMiddleware = history()

const useMiddlewares = (app) => {
  app.use(devMiddleware)
  app.use(historyMiddleware)
  app.use(devMiddleware)
  app.use(hotMiddleware)
};

module.exports = { useMiddlewares };
