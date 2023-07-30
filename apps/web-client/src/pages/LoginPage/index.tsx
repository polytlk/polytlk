import type { FC } from 'react';

import { EchoPlugin } from '@polytlk/echo-plugin';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import AuthContext, { getTokenData, KEY } from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import { LoginPage } from './LoginPage';

const LoginContainer: FC = () => {
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Create a ref
  const { setToken } = useContext(AuthContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const history = useHistory();

  useEffect(() => {
    EchoPlugin.addListener('loginResult', (data: { token: string }) => {
      SecureStoragePlugin.set({ key: KEY, value: data.token });
      const { id } = getTokenData(data.token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setToken(id);
      history.push('/home');
    });

    if (config.platform === 'web') {
      const interval = setInterval(() => {
        if (typeof window.google !== 'undefined' && buttonRef.current != null) {
          // Clear the interval so it doesn't keep running once the variable is found
          clearInterval(interval);

          // If google exists and the ref is currently referencing a button
          EchoPlugin.renderLogin({
            baseUrl: config.baseUrl,
            buttonElem: buttonRef.current,
          }); // Pass it to renderLogin
        }
      }, 1000); // Check every second

      // Cleanup function to clear the interval if the component is unmounted
      return () => clearInterval(interval);
    } else if (config.platform === 'ios') {
      EchoPlugin.renderLogin({
        baseUrl: config.baseUrl,
      });
    }
  }, []); // Empty array makes useEffect run once on component mount

  return <LoginPage buttonRef={buttonRef} />;
};

export default LoginContainer;
