import type { ariData } from './actors/observables';

import { assign, log, setup } from 'xstate';
import { z } from 'zod';

import { interpretation$ } from './actors/observables';
import { interpretationFetcher } from './actors/promises';

type eventType =
  | { type: 'SUBMIT' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'TASK_ERROR' }
  | { type: 'UPDATE_LANGUAGE'; language: 'zh' | 'kr' }
  | { type: 'UPDATE_TEXT'; text: string }
  | { type: 'TASK_COMPLETE'; data: ariData }
  | { type: 'NEW_TASK' };

const errorMessagesSchema = z.union([
  z.literal('Access to this API has been disallowed'),
  z.literal('unknown error'),
  z.literal(''),
]);

const errorSchema = z
  .object({
    message: errorMessagesSchema,
  })
  .catch({ message: 'unknown error' });

type errorMessages = z.infer<typeof errorMessagesSchema>;

export const machine = setup({
  types: {
    input: {} as {
      baseUrl: string;
      token: string;
    },
    context: {} as {
      language: 'zh' | 'kr';
      text: string;
      loading: boolean;
      inputError: errorMessages;
      inputColor: 'light' | 'danger';
      taskId: string;
      taskIds: string[];
      baseUrl: string;
      token: string;
      results: Record<string, ariData>;
    },
    events: {} as eventType,
    children: {} as {
      fetcher: 'interpretationFetcher';
      subscriber: 'interpretation$';
    },
  },
  guards: {
    isChinese: ({ context }) => context.language === 'zh',
  },
  actions: {
    clearError: assign({ inputError: '', inputColor: 'light' }),
    setLoading: assign({ loading: true }),
    resetLoading: assign({ loading: false }),
  },
  actors: {
    interpretationFetcher,
    interpretation$,
  },
}).createMachine({
  id: 'task',
  initial: 'idle',
  context: ({ input }) => ({
    language: 'zh',
    text: '',
    taskId: '',
    taskIds: [],
    inputError: '',
    inputColor: 'light',
    loading: false,
    baseUrl: input.baseUrl || '',
    token: input.token || '',
    results: {},
  }),
  states: {
    idle: {
      on: {
        CLEAR_ERRORS: {
          actions: ['clearError'],
        },
        SUBMIT: {
          guard: 'isChinese',
          target: 'verifying',
          actions: [
            assign({
              inputError: '',
              inputColor: 'light',
            }),
            'setLoading',
          ],
        },
        UPDATE_LANGUAGE: {
          actions: [assign({ language: ({ event }) => event.language })],
        },
        UPDATE_TEXT: {
          actions: [assign({ text: ({ event }) => event.text })],
        },
      },
    },
    verifying: {
      invoke: {
        id: 'fetcher',
        src: 'interpretationFetcher',
        input: ({ context }) => ({
          taskId: context.taskId,
          baseUrl: context.baseUrl,
          text: context.text,
          token: context.token,
        }),
        onDone: {
          target: 'waiting',
          actions: [assign({ taskId: ({ event }) => event.output })],
        },
        onError: {
          target: 'idle',
          actions: [
            assign({
              inputError: ({ event }) => errorSchema.parse(event.error).message,
              inputColor: 'danger',
            }),
            'resetLoading',
          ],
        },
      },
    },
    waiting: {
      on: {
        TASK_COMPLETE: {
          target: 'idle',
          actions: [
            assign({
              results: ({ context, event }) => ({
                ...context.results,
                [context.taskId]: event.data,
              }),
              taskIds: ({ context }) => [...context.taskIds, context.taskId],
            }),
            'resetLoading',
          ],
        },
        TASK_ERROR: {
          target: 'idle',
          actions: [
            assign({
              inputError: 'unknown error',
              inputColor: 'danger',
            }),
            'resetLoading',
          ],
        },
      },
      invoke: {
        id: 'subscriber',
        src: 'interpretation$',
        input: ({ context }) => ({
          taskId: context.taskId,
          baseUrl: context.baseUrl,
          token: context.token,
        }),
        onError: {
          actions: [log('onError from subscriber def called')],
        },
      },
    },
  },
});
