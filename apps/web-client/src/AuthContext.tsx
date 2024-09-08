import type { FC, ReactNode } from 'react';

import { CapacitorHttp } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { createContext, useContext, useEffect, useState } from 'react';

import ConfigContext from './ConfigContext';

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
  const config = useContext(ConfigContext)!;

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

        const response = await CapacitorHttp.post({
          url: `${config.baseUrl}/api/auth/check/`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: { key: keyData },
        });

        console.log('check reponse status', response.status);
        // If token is valid and not expired, set the state
        if (response.status === 200) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          setToken(keyData.id as string);
        } else {
          await SecureStoragePlugin.remove({ key: KEY }).catch((e) => {
            console.error('no token', e);
          });
        }

        console.log('response', response);

        // If token is valid and not expired, set the state
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
