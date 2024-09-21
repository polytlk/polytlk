import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const root = document.getElementById('root');

if (root !== null) {
  ReactDOM.render(
    <StrictMode>
      <App />
    </StrictMode>,
    root
  );
}
