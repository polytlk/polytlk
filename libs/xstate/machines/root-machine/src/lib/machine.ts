import type { AuthEvents } from 'auth-machine';
import type {
  errorMessages,
  InternalInterpretEvents,
  InterpretContext,
} from 'interpret-machine';
import type { UserInterpretEvents } from './types';

import { authChecker, deleteCookie, setCookie } from 'auth-machine';
import { machine as interpretMachine } from 'interpret-machine';
import { assign, log, raise, setup } from 'xstate';

export const machine = setup({
  types: {
    context: {} as {
      hashedToken: string;
      token: string;
      loading: boolean;
      checked: boolean;
      baseUrl: string;
      interpret: Omit<InterpretContext, 'token' | 'baseUrl' | 'inputError'> & {
        inputError: errorMessages | '';
      };
    },
    events: {} as AuthEvents | UserInterpretEvents | InternalInterpretEvents,
    children: {} as {
      machineInterpreter: 'interpretMachine';
      checkAuth: 'authChecker';
      cookieDeleter: 'deleteCookie';
      cookieSetter: 'setCookie';
    },
    input: {} as {
      baseUrl: string;
    },
  },
  actions: {
    startLoading: assign({ loading: true }),
    stopLoading: assign({ loading: false }),
    setInterpretLoading: assign(({ context }) => ({
      interpret: { ...context.interpret, loading: true },
    })),
    unsetInterpretLoading: assign(({ context }) => ({
      interpret: { ...context.interpret, loading: false },
    })),
    checked: assign({ checked: true }),
  },
  actors: {
    interpretMachine,
    authChecker,
    deleteCookie,
    setCookie,
  },
}).createMachine({
  context: ({ input }) => ({
    hashedToken: '',
    token: '',
    loading: false,
    checked: false,
    baseUrl: input.baseUrl,
    interpret: {
      text: '',
      language: 'zh',
      taskId: '',
      taskIds: [],
      inputError: '',
      inputColor: 'light',
      loading: false,
      results: {},
    },
  }),
  id: 'root',
  initial: 'logged-out',
  states: {
    'logged-out': {
      initial: 'checking-cookie',
      states: {
        'checking-cookie': {
          invoke: {
            id: 'checkAuth',
            src: 'authChecker',
            input: ({ context }) => ({
              baseUrl: context.baseUrl,
            }),
            onError: {
              actions: [raise({ type: 'COOKIE_INVALID' })],
            },
          },
          on: {
            COOKIE_VALID: {
              target: 'done',
              actions: [
                assign({
                  hashedToken: ({ event }) => event.payload.hashedToken,
                  token: ({ event }) => event.payload.token,
                }),
                'stopLoading',
                'checked',
              ],
            },
            COOKIE_INVALID: {
              target: 'idle',
              actions: ['stopLoading', 'checked'],
            },
          },
        },
        idle: {
          on: {
            START_LOGIN: {
              target: 'setting-cookie',
              actions: assign({
                hashedToken: ({ event }) => event.hashedToken,
              }),
            },
          },
        },
        'setting-cookie': {
          invoke: {
            id: 'cookieSetter',
            src: 'setCookie',
            input: ({ context }) => ({ token: context.hashedToken }),
            onDone: {
              target: 'done',
              actions: assign({ token: ({ event }) => event.output }),
            },
            onError: {
              target: 'idle',
              actions: 'stopLoading',
            },
          },
        },
        done: {
          type: 'final',
        },
      },
      onDone: {
        target: 'logged-in',
      },
    },
    'logged-in': {
      initial: 'ready',
      states: {
        ready: {
          on: {
            LOGOUT: {
              target: 'logging-out',
            },
            UPDATE_TEXT: {
              actions: assign({
                interpret: ({ context, event }) => ({
                  ...context.interpret,
                  text: event.text,
                }),
              }),
            },
            UPDATE_LANGUAGE: {
              actions: assign({
                interpret: ({ context, event }) => ({
                  ...context.interpret,
                  language: event.language,
                }),
              }),
            },
            SUBMIT: {
              target: 'interpreting',
            },
          },
        },
        interpreting: {
          entry: 'setInterpretLoading',
          exit: 'unsetInterpretLoading',
          invoke: {
            id: 'machineInterpreter',
            src: 'interpretMachine',
            input: ({ context }) => {
              return {
                token: context.token,
                baseUrl: context.baseUrl,
                text: context.interpret.text,
                language: context.interpret.language,
              };
            },
          },
          on: {
            LOGOUT: {
              target: 'logging-out',
            },
            TASK_COMPLETE: {
              target: 'ready',
              actions: [
                log('task complete from root'),
                ({ event, context }) => {
                  console.log('event', event);
                  console.log('context', context);
                },
                assign({
                  interpret: ({ context, event }) => ({
                    ...context.interpret,
                    results: {
                      ...context.interpret.results,
                      [event.taskId]: event.data,
                    },
                    taskIds: [...context.interpret.taskIds, event.taskId],
                  }),
                }),
              ],
            },
            VERIFYING_ERROR: {
              target: 'ready',
              actions: [
                assign({
                  interpret: ({ event, context }) => ({
                    ...context.interpret,
                    inputColor: 'danger',
                    inputError: event.error,
                  }),
                }),
              ],
            },
            WAITING_ERROR: {
              target: 'ready',
              actions: [
                assign({
                  interpret: ({ event, context }) => ({
                    ...context.interpret,
                    inputColor: 'danger',
                    inputError: event.error,
                  }),
                }),
              ],
            },
          },
        },
        'logging-out': {
          invoke: {
            id: 'cookieDeleter',
            src: 'deleteCookie',
            onDone: {
              target: 'done',
              actions: assign({
                token: '',
                hashedToken: '',
              }),
            },
            onError: {
              target: 'done',
              actions: assign({
                token: '',
                hashedToken: '',
              }),
            },
          },
        },
        done: {
          type: 'final',
        },
      },
      onDone: {
        target: 'logged-out',
      },
    },
  },
});
