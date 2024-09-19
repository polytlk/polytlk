import type { ariData } from './actors/observables';

import { assign, sendParent, setup } from 'xstate';
import { z } from 'zod';

import { interpretation$ } from './actors/observables';
import { interpretationFetcher } from './actors/promises';

type eventType =
  | { type: 'TASK_ERROR' }
  | { type: 'TASK_COMPLETE'; data: ariData };

const errorMessagesSchema = z.union([
  z.literal('Access to this API has been disallowed'),
  z.literal('unknown error'),
]);

const errorSchema = z
  .object({
    message: errorMessagesSchema,
  })
  .catch({ message: 'unknown error' });

export type errorMessages = z.infer<typeof errorMessagesSchema>;

export type InterpretContext = {
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
};

// TODO: find a way to have some type safety when sending to parent without causing circular dependency
export type InternalInterpretEvents =
  | { type: 'VERIFYING_ERROR'; error: errorMessages }
  | { type: 'WAITING_ERROR'; error: 'unknown error' }
  | { type: 'TASK_COMPLETE'; data: ariData; taskId: string };

export const machine = setup({
  types: {
    input: {} as {
      baseUrl: string;
      token: string;
      language: 'zh' | 'kr';
      text: string;
    },
    context: {} as Pick<
      InterpretContext,
      'taskId' | 'baseUrl' | 'token' | 'text' | 'language'
    >,
    events: {} as eventType,
    children: {} as {
      fetcher: 'interpretationFetcher';
      subscriber: 'interpretation$';
    },
  },
  actors: {
    interpretationFetcher,
    interpretation$,
  },
}).createMachine({
  id: 'task',
  initial: 'verifying',
  context: ({ input }) => ({
    language: input.language,
    text: input.text,
    taskId: '',
    baseUrl: input.baseUrl || '',
    token: input.token || '',
  }),
  states: {
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
          target: 'done',
          actions: [
            sendParent(({ event }) => {
              return {
                type: 'VERIFYING_ERROR',
                error: errorSchema.parse(event.error).message,
              };
            }),
          ],
        },
      },
    },
    waiting: {
      on: {
        TASK_COMPLETE: {
          target: 'done',
          actions: [
            sendParent(({ event, context }) => {
              return {
                type: 'TASK_COMPLETE',
                data: event.data,
                taskId: context.taskId,
              };
            }),
          ],
        },
        TASK_ERROR: {
          target: 'done',
          actions: [
            sendParent({ type: 'WAITING_ERROR', error: 'unknown error' }),
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
      },
    },
    done: {
      type: 'final',
    },
  },
});
