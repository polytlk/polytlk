import { Device } from '@capacitor/device';

export type ClientConfig =
  | {
      baseUrl: string;
      platform: 'web';
      env: string;
      clientId: string;
    }
  | {
      baseUrl: string;
      platform: 'ios' | 'android';
      env: string;
    };

const baseWebConfig = {
  baseUrl: import.meta.env.BASE_URL,
  env: import.meta.env.TARGET_ENV,
  clientId: import.meta.env.CLIENT_ID_WEB,
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
        ...baseWebConfig,
        platform,
      };
    } else {
      this.data = {
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
