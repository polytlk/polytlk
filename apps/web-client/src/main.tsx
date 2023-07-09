import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if (process.env.NODE_ENV === 'development' && process.env.NX_LOCAL_MODE === 'msw') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { worker } = require('./mocks/browser')
  worker.start({
    serviceWorker: {
      url: './mockServiceWorker.js',
      options: {
        scope: '/'
      }
    },
  })
}

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
