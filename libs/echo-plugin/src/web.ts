import { WebPlugin } from '@capacitor/core';

import type { EchoPluginPlugin } from './definitions';

export class EchoPluginWeb extends WebPlugin implements EchoPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log(`ECHO from WEB -> ${options.value}`);
    return options;
  }
}
