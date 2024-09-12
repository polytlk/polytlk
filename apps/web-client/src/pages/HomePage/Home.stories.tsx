import type { Meta, StoryObj } from '@storybook/react';

import { RootContext } from '../../RootContext';
import Home from './Home';

const meta: Meta<typeof Home> = {
  component: Home,
  title: 'Pages/Home',
};
export default meta;
type Story = StoryObj<typeof Home>;

export const Primary: Story = {
  decorators: [
    (Story) => (
      <RootContext.Provider
        options={{
          input: {
            baseUrl: '',
            taskIds: [],
            results: {},
          },
        }}
      >
        <Story />
      </RootContext.Provider>
    ),
  ],
  args: {
    language: 'zh',
    loading: false,
    text: '',
  },
};

export const Interpreted: Story = {
  decorators: [
    (Story) => (
      <RootContext.Provider
        options={{
          input: {
            baseUrl: '',
            taskIds: ['111'],
            results: {
              '111': {
                words: [
                  ['你', 'nǐ', 'you'],
                  ['想', 'xiǎng', 'want'],
                  ['找', 'zhǎo', 'to find'],
                  ['我', 'wǒ', 'me'],
                  ['聊天', 'liáotiān', 'chat'],
                  ['随时', 'suíshí', 'anytime'],
                  ['都可以', 'dōu kěyǐ', 'can'],
                ],
                meaning: 'You can find me to chat anytime.',
                dialogue: [
                  [
                    '你想找我聊天随时都可以吗？',
                    'Nǐ xiǎng zhǎo wǒ liáotiān suíshí dōu kěyǐ ma?',
                    'Can you find me to chat anytime?',
                  ],
                  [
                    '是的，我有什么事情想和你聊一聊。',
                    'Shì de, wǒ yǒu shénme shìqíng xiǎng hé nǐ liáo yī liáo.',
                    'Yes, I have something I want to chat with you about.',
                  ],
                ],
              },
            },
          },
        }}
      >
        <Story />
      </RootContext.Provider>
    ),
  ],
  args: {
    language: 'zh',
    loading: false,
    text: '你想找我聊天随时都可以',
  },
};
