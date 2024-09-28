import { fromPromise } from 'xstate';

import { Device } from '@capacitor/device';

import { envSchema } from './env-schema';

export const getConfig = fromPromise(
  async ({ input }: { input: { env: unknown } }) => {
    const { platform, isVirtual } = await Device.getInfo();
    const result = envSchema.parse(input.env);

    return { config: result, platform, isVirtual };
  }
);
