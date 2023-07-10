import React from 'react';

// Create a Context with default value as empty string
const AuthContext = React.createContext<{
  token: string;
  setToken: (token: string) => void;
}>({
  token: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setToken: (token: string) => {},
});

export default AuthContext;
