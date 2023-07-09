import { Device } from '@capacitor/device';

type Env = 'development' | 'simulated_ios' | 'real_dev_ios';

type baseUrl = 'http://localhost:8080' | 'http://localhost:4200' | 'https://polytlk.ngrok.io'

export type ClientConfig = {
  baseUrl: baseUrl;
  env: Env
  oAuth2AuthOpts: {
    scope: string;
    web: {
      appId: string
    }
  }
};


const baseConfig = {
  baseUrl: process.env.NODE_ENV === 'development' && process.env.NX_LOCAL_MODE === 'msw' ? 'http://localhost:4200' : 'http://localhost:8080',
  oAuth2AuthOpts: {
    scope: "email profile",
    web: {
      appId: '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com',
    },
  }
} as const

class Config {
  private static instance: Config;
  private data: ClientConfig | null = null;

  private constructor() { }

  public static async getInstance(): Promise<Config> {
    if (!Config.instance) {
      const _config = new Config();
      await _config.load();
      Config.instance = _config
    }
    return Config.instance;
  }

  private async load() {
    const { platform, isVirtual } = await Device.getInfo();
    let env: Env;

    if (platform === "web") {
      env = 'development';
    } else {
      env = isVirtual ? 'simulated_ios' : 'real_dev_ios';
    }

    switch (env) {
      case 'development':
        this.data = {
          ...baseConfig,
          env,
        };
        break;
      case 'simulated_ios':
        this.data = {
          ...baseConfig,
          env,
        };
        break;
      case 'real_dev_ios':
        this.data = {
          ...baseConfig,
          env,
          baseUrl: 'https://polytlk.ngrok.io'
        };
        break;
      default:
        throw new Error(`Unsupported environment: ${env}`);
    }

    Object.freeze(this.data);  // Prevents further modifications to the config object
  }

  public get(): ClientConfig {
    if (this.data === null) {
      throw new Error('Config not yet loaded');
    }
    return this.data;
  }
}

export default Config

