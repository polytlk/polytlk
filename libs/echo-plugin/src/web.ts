import type { EchoPluginPlugin } from './definitions';

import { WebPlugin } from '@capacitor/core';

export class EchoPluginWeb extends WebPlugin implements EchoPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log(`ECHO from WEB -> ${options.value}`);
    return options;
  }
}
