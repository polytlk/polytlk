import type { EchoPluginPlugin } from './definitions';

import { registerPlugin } from '@capacitor/core';

const EchoPlugin = registerPlugin<EchoPluginPlugin>('EchoPlugin', {
  web: () => import('./web').then((m) => new m.EchoPluginWeb()),
});

export * from './definitions';
export { EchoPlugin };
