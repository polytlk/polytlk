import type { PluginListenerHandle } from '@capacitor/core';

export interface renderLoginWebProps {
  buttonElem: HTMLElement;
  baseUrl: string;
  platform: 'web';
  clientId: string;
}

interface renderLoginIosProps {
  baseUrl: string;
  platform: 'ios';
}

export type renderLoginProps = renderLoginWebProps | renderLoginIosProps;

export interface EchoPluginPlugin {
  renderLogin(data: renderLoginProps): Promise<void>;
  addListener(
    eventName: 'loginResult',
    listenerFunc: (data: { token: string }) => void
  ): PluginListenerHandle;
}
