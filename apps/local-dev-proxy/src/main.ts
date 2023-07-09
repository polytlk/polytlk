/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware'
const port = process.env.PORT || 3333;

const app = express();

// USE (PRO) TYK DASHBOARD
// baseUrl: 'http://localhost:3000',
// USE (CE) TYK GATEWAY
// Forward requests starting with /api to the API server
app.use('/api', createProxyMiddleware({ target: 'http://localhost:8080', changeOrigin: false }));

// Forward all other requests to the client server
app.use('/', createProxyMiddleware({ target: 'http://localhost:4200', changeOrigin: true }));

const server = app.listen(port, () => {
  console.log(`Proxy listening at http://localhost:${port}`);
});



