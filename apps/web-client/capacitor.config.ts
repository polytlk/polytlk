import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.polytlk',
  appName: 'polytlk-client',
  webDir: '../../dist/apps/web-client',
  loggingBehavior: 'production',
  bundledWebRuntime: false,
};

export default config;
