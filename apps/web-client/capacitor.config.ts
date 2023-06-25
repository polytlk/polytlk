import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'web-client',
  webDir: '../../dist/apps/web-client',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;
