import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

const root = document.getElementById('root');

if (root !== null) {
  ReactDOM.render(
    <StrictMode>
      <Root />
    </StrictMode>,
    root
  );
}
