import type { FC, ReactNode } from 'react';

import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { createContext, useEffect, useState } from 'react';

export const KEY = 'authToken';

export const getTokenData = (token: string) => {
  return JSON.parse(atob(token));
};

// Create a Context with default value as empty string
const AuthContext = createContext<{
  token: string;
  setToken: (token: string) => void;
  loading: boolean;
}>({
  token: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setToken: (token: string) => {},
  loading: true,
});

// Auth Provider component
const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true); // add a loading state

  useEffect(() => {
    const checkAuthState = async () => {
      const savedToken = await SecureStoragePlugin.get({ key: KEY }).catch(
        (e) => {
          console.error('no token', e);
        }
      );

      if (savedToken != null && savedToken.value !== '') {
        const keyData = getTokenData(savedToken.value);
        console.log('keyData from authProvider', keyData);

        // If token is valid and not expired, set the state
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        setToken(keyData.id as string);
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

  // The provider for the Auth context
  return (
    <AuthContext.Provider value={{ token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
