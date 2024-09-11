import { assign, log, setup } from 'xstate';

import { authChecker } from './cookie-checker-machine';
import { deleteCookie, setCookie } from './promises';

export const machine = setup({
  types: {
    context: {} as {
      hashedToken: string;
      token: string;
      loading: boolean;
      checked: boolean;
      baseUrl: string;
    },
    events: {} as
      | { type: 'LOGOUT' }
      | {
          type: 'COOKIE_VALID';
          payload: { hashedToken: string; token: string };
        }
      | { type: 'COOKIE_INVALID' }
      | { type: 'START_LOGIN'; hashedToken: string },
    children: {} as {
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
    checked: assign({ checked: true }),
  },
  actors: {
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
  }),
  id: 'authentication',
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
            onDone: {
              actions: [log('checking-cookie invokcation done')],
            },
            onError: {
              target: 'idle',
              actions: ['stopLoading', 'checked'],
            },
          },
          on: {
            COOKIE_VALID: {
              target: 'done',
              actions: [log('cookie valid'), 'stopLoading', 'checked'],
            },
            COOKIE_INVALID: {
              target: 'idle',
              actions: [log('cookie valid'), 'stopLoading', 'checked'],
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
