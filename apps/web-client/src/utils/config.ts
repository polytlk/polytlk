import type { OAuth2AuthenticateOptions } from '@byteowls/capacitor-oauth2';
import { Device } from '@capacitor/device';

type Env = 'development' | 'simulated_ios' | 'real_dev_ios';

export type ClientConfig = {
    baseUrl: string;
    env: Env
    oAuth2AuthOpts: OAuth2AuthenticateOptions 
};

const baseConfig = {
    baseUrl: 'https://polytlk.ngrok.io',
    oAuth2AuthOpts: {
      authorizationBaseUrl: "https://accounts.google.com/o/oauth2/auth",
      accessTokenEndpoint: "https://www.googleapis.com/oauth2/v4/token",
      scope: "email profile",
      resourceUrl: "https://www.googleapis.com/userinfo/v2/me",
      web: {
        appId: '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com',
        responseType: "token", // implicit flow
        accessTokenEndpoint: "", // clear the tokenEndpoint as we know that implicit flow gets the accessToken from the authorizationRequest
        redirectUrl: "https://polytlk.ngrok.io",
        windowOptions: "height=600,left=0,top=0"
      },
      // ios: {
      //   appId: environment.oauthAppId.google.ios,
      //   responseType: "code", // if you configured a ios app in google dev console the value must be "code"
      //   redirectUrl: "com.companyname.appname:/" // Bundle ID from google dev console
      // }
    }
} as const

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
            ...baseConfig,
            env,
            // USE MSW INSTEAD OF TYK GATEWAY
            // baseUrl: 'http://localhost:4200',
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

