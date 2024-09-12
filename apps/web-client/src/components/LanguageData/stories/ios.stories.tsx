import type { Meta, StoryObj } from '@storybook/react';

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

import { RootContext } from '../../../RootContext';
import { LanguageData } from '..';

const baseInput = {
  env: {},
  platform: 'ios',
} as const;

const meta: Meta<typeof LanguageData> = {
  component: LanguageData,
  title: 'Components/LanguageData/iOS',
  parameters: {
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
      },
      defaultViewport: 'iphone12promax',
    },
  },
  decorators: [
    (Story) => (
      <RootContext.Provider
        options={{
          input: {
            ...baseInput,
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
};
export default meta;
type Story = StoryObj<typeof LanguageData>;

export const Primary: Story = {
  args: {
    id: '111',
  },
};

export const Expanded: Story = {
  args: {
    id: '111',
  },
};
