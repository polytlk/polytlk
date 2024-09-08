import type { EchoPluginPlugin, renderLoginWebProps } from './definitions';

import { WebPlugin } from '@capacitor/core';

declare global {
  const google: {
    accounts: {
      id: {
        initialize: (opts: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
        }) => void;
        renderButton: (elem: HTMLElement, opts: { theme: string }) => void;
        prompt: () => void;
      };
    };
  };
}

export class EchoPluginWeb extends WebPlugin implements EchoPluginPlugin {
  constructor() {
    super();

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
  }

  async renderLogin(data: renderLoginWebProps): Promise<void> {
    if (google?.accounts?.id) {
      const { clientId, baseUrl, buttonElem } = data;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if ('credential' in response) {
            const { credential } = response;

            const url = `${baseUrl}/api/auth/exchange/`;
            const rawExchangeResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: credential,
              }),
            });

            const { token } = await rawExchangeResponse.json();

            if (token) {
              this.notifyListeners('loginResult', { token });
            }
          }
        },
      });

      google.accounts.id.prompt();
      google.accounts.id.renderButton(buttonElem, { theme: 'filled_blue' });
    } else {
      console.error('Google script has not loaded yet');
    }
  }
}
