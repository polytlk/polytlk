import type { FC } from 'react';
import type { CodeResponse, TokenResponse } from './types';

import { useCallback, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import useScript from 'react-script-hook';

import AuthContext from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import { LoginPage } from './LoginPage';

const LoginContainer: FC = () => {
  const { setToken } = useContext(AuthContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const config = useContext(ConfigContext)!;
  const history = useHistory();

  useScript({
    src: 'https://accounts.google.com/gsi/client',
    onload: () => {
      //@ts-expect-error ssss
      const client = google.accounts.oauth2['initTokenClient']({
        client_id: config.oAuth2AuthOpts.web?.appId,
        scope: config.oAuth2AuthOpts.scope,
        callback: async (response: CodeResponse | TokenResponse) => {
          const { access_token } = response as TokenResponse;
          const url = `${config.baseUrl}/api/auth/exchange/`;
          const rawExchangeResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: access_token,
            }),
          });

          const { token } = await rawExchangeResponse.json();

          if (token) {
            const keyData = JSON.parse(atob(token));
            setToken(keyData.id);
            history.push('/home');
          }
        },
      });

      //@ts-expect-error ssss
      window.gClient = client;
    },
  });

  const newGoogleLogin = useCallback(() => {
    //@ts-expect-error ssss
    window.gClient.requestAccessToken();
  }, []);

  return <LoginPage newGoogleLogin={newGoogleLogin} />;
};

export default LoginContainer;
