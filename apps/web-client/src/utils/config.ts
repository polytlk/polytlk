import { Device } from '@capacitor/device';

type Env = 'development' | 'simulated_ios' | 'real_dev_ios';

export type ClientConfig = {
    baseUrl: string;
    env: Env
};

class Config {
  private static instance: Config;
  private data: ClientConfig | null = null;

  private constructor() {}

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
            env,
            baseUrl: 'http://localhost:6688',
        };
        break;
      case 'simulated_ios':
        this.data = {
            env,
            baseUrl: 'http://localhost:6688',
        };
        break;
      case 'real_dev_ios':
        this.data = {
            env,
            baseUrl: 'https://ua5kk745.ngrok.app',
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

