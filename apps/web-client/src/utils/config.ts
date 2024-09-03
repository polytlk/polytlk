import { Device } from '@capacitor/device';

export type ClientConfig = {
  baseUrl: string;
  platform: 'web' | 'ios' | 'android';
  env: string;
  oAuth2AuthOpts: {
    scope: string;
    web: {
      appId: string;
    };
  };
};

const baseConfig = {
  oAuth2AuthOpts: {
    scope: 'email profile',
    web: {
      appId:
        '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com',
    },
  },
} as const;

const baseWebConfig = {
  baseUrl: import.meta.env.BASE_URL,
  env: import.meta.env.TARGET_ENV,
} as const;

class Config {
  private static instance: Config | null = null;
  private data: ClientConfig | null = null;

  public static async getInstance(): Promise<Config> {
    if (Config.instance == null) {
      const _config = new Config();
      await _config.load();
      Config.instance = _config;
    }
    return Config.instance;
  }

  private async load() {
    const { platform, isVirtual } = await Device.getInfo();

    if (platform === 'web') {
      this.data = {
        ...baseConfig,
        ...baseWebConfig,
        platform,
      };
    } else {
      this.data = {
        ...baseConfig,
        platform,
        // baseWebConfig cannot be trusted when running from native client
        env: isVirtual ? 'simulated_ios' : 'real_ios',
        baseUrl: isVirtual
          ? 'http://localhost:8080'
          : 'https://dev.api.polytlk.io',
      };
    }

    Object.freeze(this.data); // Prevents further modifications to the config object
  }

  public get(): ClientConfig {
    if (this.data === null) {
      throw new Error('Config not yet loaded');
    }
    return this.data;
  }
}

export default Config;
