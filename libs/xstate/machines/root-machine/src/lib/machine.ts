import type { AuthEvents } from 'auth-machine';
import type {
  ariData,
  InterpretContext,
  InterpretEvents,
} from 'interpret-machine';

import { authChecker, deleteCookie, setCookie } from 'auth-machine';
import { machine as interpretMachine } from 'interpret-machine';
import { assign, raise, sendTo, setup } from 'xstate';

export const machine = setup({
  types: {
    context: {} as {
      hashedToken: string;
      token: string;
      loading: boolean;
      checked: boolean;
      baseUrl: string;
      interpret: Omit<InterpretContext, 'token' | 'baseUrl'>;
    },
    events: {} as
      | AuthEvents
      | InterpretEvents
      | { type: 'INTERPRET_LOADING' }
      | { type: 'INTERPRET_LOAD_DONE' }
      | { type: 'ROOT_TASK_COMPLETE'; data: ariData; taskId: string },
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
          invoke: {
            id: 'machineInterpreter',
            src: 'interpretMachine',
            input: ({ context }) => {
              return {
                token: context.token,
                baseUrl: context.baseUrl,
              };
            },
          },
          on: {
            LOGOUT: {
              target: 'logging-out',
            },
            INTERPRET_LOADING: {
              actions: 'setInterpretLoading',
            },
            INTERPRET_LOAD_DONE: {
              actions: 'unsetInterpretLoading',
            },
            UPDATE_TEXT: {
              actions: sendTo('machineInterpreter', ({ event }) => {
                return { type: 'UPDATE_TEXT', text: event.text };
              }),
            },
            UPDATE_LANGUAGE: {
              actions: sendTo('machineInterpreter', ({ event }) => {
                return { type: 'UPDATE_LANGUAGE', language: event.language };
              }),
            },
            SUBMIT: {
              actions: sendTo('machineInterpreter', () => {
                return { type: 'SUBMIT' };
              }),
            },
            ROOT_TASK_COMPLETE: {
              actions: assign({
                interpret: ({ context, event }) => ({
                  ...context.interpret,
                  results: {
                    ...context.interpret.results,
                    [event.taskId]: event.data,
                  },
                  taskIds: [...context.interpret.taskIds, event.taskId],
                }),
              }),
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
