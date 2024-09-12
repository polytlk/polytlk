import type { FC } from 'react';

import { EchoPlugin } from '@polytlk/echo-plugin';
import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { RootContext } from '../../RootContext';
import { LoginPage } from './LoginPage';

const { useActorRef, useSelector } = RootContext;

const LoginContainer: FC = () => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useActorRef();
  const history = useHistory();
  const token = useSelector(({ context }) => context.token);
  const loading = useSelector(({ context }) => context.loading);

  const platform = useSelector(({ context }) => context.platform);
  const baseUrl = useSelector(({ context }) => context.config.BASE_URL);
  const clientId = useSelector(({ context }) => context.config.CLIENT_ID_WEB);

  useEffect(() => {
    EchoPlugin.addListener('loginResult', (data: { token: string }) => {
      rootRef.send({ type: 'START_LOGIN', hashedToken: data.token });
    });

    if (platform === 'web') {
      const interval = setInterval(() => {
        // @ts-expect-error fdffasd
        if (typeof window.google !== 'undefined' && buttonRef.current != null) {
          // Clear the interval so it doesn't keep running once the variable is found
          clearInterval(interval);

          // If google exists and the ref is currently referencing a button
          EchoPlugin.renderLogin({
            baseUrl,
            buttonElem: buttonRef.current,
            platform,
            clientId,
          }); // Pass it to renderLogin
        }
      }, 1000); // Check every second

      // Cleanup function to clear the interval if the component is unmounted
      return () => clearInterval(interval);
    } else if (platform === 'ios') {
      EchoPlugin.renderLogin({
        baseUrl,
        platform,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array makes useEffect run once on component mount

  useEffect(() => {
    if (token !== '' && !loading) {
      history.push('/home');
    }
  }, [history, token, loading]);

  return <LoginPage buttonRef={buttonRef} />;
};

export default LoginContainer;
