import type { Meta } from '@storybook/react';
import LoginPage from './index';

const Story: Meta<typeof LoginPage> = {
  component: LoginPage,
  title: 'LoginPage',
};
export default Story;

export const Primary = {
  args: {},
};
