import React from 'react';

// Create a Context with default value as empty string
const AuthContext = React.createContext({
  token: '',
  setToken: (token: string) => {},
});

export default AuthContext;