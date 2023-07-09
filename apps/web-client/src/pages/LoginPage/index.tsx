import { useHistory } from 'react-router-dom';
import React, { useContext, useCallback } from 'react';
import AuthContext from '../../AuthContext';
import ConfigContext from '../../ConfigContext';
import useScript from 'react-script-hook';
import { LoginPage } from './LoginPage';

type ErrorCode =
  | 'invalid_request'
  | 'access_denied'
  | 'unauthorized_client'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable';

export interface CodeResponse {
  /** The authorization code of a successful token response */
  code: string;
  /**	A space-delimited list of [scopes](https://developers.google.com/identity/protocols/oauth2/scopes) that are approved by the user */
  scope: string;
  /**	The string value that your application uses to maintain state between your authorization request and the response */
  state?: string;
  /**	A single ASCII error code */
  error?: ErrorCode;
  /** Human-readable ASCII text providing additional information, used to assist the client developer in understanding the error that occurred */
  error_description?: string;
  /** A URI identifying a human-readable web page with information about the error, used to provide the client developer with additional information about the error */
  error_uri?: string;
}


export interface TokenResponse {
  /** The access token of a successful token response. */
  access_token: string;
  /** The lifetime in seconds of the access token. */
  expires_in: number;
  /** The hosted domain the signed-in user belongs to. */
  hd?: string;
  /** The prompt value that was used from the possible list of values specified by TokenClientConfig or OverridableTokenClientConfig */
  prompt: string;
  /** The type of the token issued. */
  token_type: string;
  /** A space-delimited list of [scopes](https://developers.google.com/identity/protocols/oauth2/scopes) that are approved by the user. */
  scope: string;
  /** The string value that your application uses to maintain state between your authorization request and the response. */
  state?: string;
  /** A single ASCII error code. */
  error?: ErrorCode;
  /**	Human-readable ASCII text providing additional information, used to assist the client developer in understanding the error that occurred. */
  error_description?: string;
  /** A URI identifying a human-readable web page with information about the error, used to provide the client developer with additional information about the error. */
  error_uri?: string;
}


const LoginContainer: React.FC = () => {
    const { setToken } = useContext(AuthContext);
    const config = useContext(ConfigContext)!
    const history = useHistory();

    useScript({
        src: 'https://accounts.google.com/gsi/client', onload: () => {
            //@ts-expect-error ssss
            const client = google.accounts.oauth2['initTokenClient']({
                client_id: config.oAuth2AuthOpts.web?.appId,
                scope: config.oAuth2AuthOpts.scope,
                callback: async (response: CodeResponse | TokenResponse) => {
                    const { access_token } = response as TokenResponse;
                    const url = `${config.baseUrl}/api/auth/exchange/`
                    const rawExchangeResponse = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: access_token,
                        }),
                    })

                    const { token } = await rawExchangeResponse.json()

                    if (token) {
                        const keyData = JSON.parse(atob(token))
                        setToken(keyData.id);
                        history.push('/home');
                    }
                },
            })

            //@ts-expect-error ssss
            window.gClient = client
        }
    });

    const newGoogleLogin = useCallback(() => {
        //@ts-expect-error ssss
        window.gClient.requestAccessToken()
    }, []);

    return  <LoginPage newGoogleLogin={newGoogleLogin} />
};

export default LoginContainer;