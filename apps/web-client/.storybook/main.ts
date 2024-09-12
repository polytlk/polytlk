import type { StorybookConfig } from '@storybook/react-webpack5';

import { webpack } from '@import-meta-env/unplugin';
import { env } from 'process';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@nx/react/plugins/storybook',
    //'@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    const unplugin = webpack({
      example: `${env.NX_WORKSPACE_ROOT}/apps/${env.NX_TASK_TARGET_PROJECT}/.env.example`,
      env: `${env.NX_WORKSPACE_ROOT}/apps/${env.NX_TASK_TARGET_PROJECT}/.env`,
    });

    config.plugins = [...(config.plugins || []), unplugin];

    return config;
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
