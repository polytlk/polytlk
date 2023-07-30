import type { Meta } from '@storybook/react';

import Home from './Home';

const Story: Meta<typeof Home> = {
  component: Home,
  title: 'Home',
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
