import type { Meta } from '@storybook/react';

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

import Home from './Home';

const Story: Meta<typeof Home> = {
  component: Home,
  title: 'Home',
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphone12promax',
    },
  },
};
export default Story;

export const Primary = {
  args: {
    data: null,
    language: 'zh',
    loading: false,
    text: '',
  },
};
