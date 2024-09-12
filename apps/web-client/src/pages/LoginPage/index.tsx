import type { FC } from 'react';

import { EchoPlugin } from '@polytlk/echo-plugin';
import { useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import ConfigContext from '../../ConfigContext';
import { RootContext } from '../../RootContext';
import { LoginPage } from './LoginPage';

const LoginContainer: FC = () => {
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Create a ref
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const rootRef = RootContext.useActorRef();
  const history = useHistory();
  const token = RootContext.useSelector(({ context }) => context.token);
  const loading = RootContext.useSelector(({ context }) => context.loading);
  console.log("token", token)
  console.log("loading", loading)

  useEffect(() => {
    EchoPlugin.addListener('loginResult', (data: { token: string }) => {
      rootRef.send({ type: 'START_LOGIN', hashedToken: data.token });
    });

    if (config.platform === 'web') {
      const interval = setInterval(() => {
        // @ts-expect-error fdffasd
        if (typeof window.google !== 'undefined' && buttonRef.current != null) {
          // Clear the interval so it doesn't keep running once the variable is found
          clearInterval(interval);

          // If google exists and the ref is currently referencing a button
          EchoPlugin.renderLogin({
            baseUrl: config.baseUrl,
            buttonElem: buttonRef.current,
            platform: config.platform,
            clientId: config.clientId,
          }); // Pass it to renderLogin
        }
      }, 1000); // Check every second

      // Cleanup function to clear the interval if the component is unmounted
      return () => clearInterval(interval);
    } else if (config.platform === 'ios') {
      EchoPlugin.renderLogin({
        baseUrl: config.baseUrl,
        platform: config.platform,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array makes useEffect run once on component mount

  useEffect(() => {
    if (token && !loading) {
      history.push('/home');
    }
  }, [history, token, loading]);

  return <LoginPage buttonRef={buttonRef} />;
};

export default LoginContainer;
