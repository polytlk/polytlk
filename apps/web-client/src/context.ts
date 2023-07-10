import React from 'react';

export const IframeContext =
  React.createContext<React.RefObject<HTMLIFrameElement> | null>(null);
