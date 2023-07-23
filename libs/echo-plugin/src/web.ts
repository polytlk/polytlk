import type { EchoPluginPlugin } from './definitions';
import { WebPlugin } from '@capacitor/core';

declare global {
  var google: {
    accounts: {
      id: {
        initialize: (opts: { client_id: string, callback: (response: { credential?: string }) => void }) => void
        renderButton: (elem: HTMLElement, opts: { theme: string }) => void
        prompt: () => void
      }
    }
  }
}

export class EchoPluginWeb extends WebPlugin implements EchoPluginPlugin {
  constructor() {
    super()

    let script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.head.appendChild(script);
  }

  async renderLogin(buttonElem: HTMLElement ): Promise<void> {
    if (google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com',
        callback: async (response) => {
          if ('credential' in response) {
            const { credential } = response;

            this.notifyListeners("loginResult", credential)
          }
        },
      });

      google.accounts.id.prompt();
      google.accounts.id.renderButton(buttonElem, { theme: "filled_blue" });
    } else {
      console.error('Google script has not loaded yet');
    }
  }
}
