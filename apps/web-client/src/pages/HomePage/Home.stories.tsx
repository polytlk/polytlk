import type { Meta, StoryObj } from '@storybook/react';

import Home from './Home';

const meta: Meta<typeof Home> = {
  component: Home,
  title: 'Home',
};
export default meta;
type Story = StoryObj<typeof Home>;

export const Primary: Story = {
  args: {
    data: null,
    language: 'zh',
    loading: false,
    text: '',
  },
};
