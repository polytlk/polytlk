import type { FC } from 'react';

import { EchoPlugin } from '@polytlk/echo-plugin';
import { useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import AuthContext from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import { LoginPage } from './LoginPage';

const LoginContainer: FC = () => {
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Create a ref
  const { setToken } = useContext(AuthContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const history = useHistory();

  useEffect(() => {
    EchoPlugin.addListener('loginResult', (token: string) => {
      console.log('data from loginResult listener', token);
      const keyData = JSON.parse(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setToken(keyData.id);
      history.push('/home');
    });

    if (config.platform === 'web') {
      const interval = setInterval(() => {
        if (typeof window.google !== 'undefined' && buttonRef.current != null) {
          // Clear the interval so it doesn't keep running once the variable is found
          clearInterval(interval);

          // If google exists and the ref is currently referencing a button
          EchoPlugin.renderLogin(buttonRef.current, config.baseUrl); // Pass it to renderLogin
        }
      }, 1000); // Check every second

      // Cleanup function to clear the interval if the component is unmounted
      return () => clearInterval(interval);
    } else if (config.platform === 'ios') {
      //@ts-expect-error ios doesnt need args
      EchoPlugin.renderLogin();
    }
  }, []); // Empty array makes useEffect run once on component mount

  return <LoginPage buttonRef={buttonRef} />;
};

export default LoginContainer;
