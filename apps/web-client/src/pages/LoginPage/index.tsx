import type { FC } from 'react';

import { EchoPlugin } from '@polytlk/echo-plugin';
import { useEffect } from 'react';
import { useSelector } from '#rootmachine/index';

import { LoginPage } from './LoginPage';

const LoginContainer: FC = () => {
  const platform = useSelector(({ context }) => context.platform);
  const baseUrl = useSelector(({ context }) => context.config.BASE_URL);


  useEffect(() => {
    //EchoPlugin.addListener('loginResult', (data: { token: string }) => {
    //  SecureStoragePlugin.set({ key: KEY, value: data.token });
    //  const { id } = getTokenData(data.token);
    //  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    //  setToken(id);
    //  history.push('/home');
    //});

    if (platform === 'ios') {
      EchoPlugin.renderLogin({
        baseUrl,
        platform
      });
    }
  }, []); // Empty array makes useEffect run once on component mount

  return <LoginPage />;
};

export default LoginContainer;
