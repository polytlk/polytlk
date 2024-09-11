import { assign, enqueueActions, raise, setup } from 'xstate';

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
      | { type: 'CHECK_COOKIE' }
      | { type: 'COOKIE_VALID' }
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
      entry: enqueueActions(({ enqueue, context }) => {
        if (!context.checked) {
          enqueue.raise({ type: 'CHECK_COOKIE' });
        }
      }),
      on: {
        CHECK_COOKIE: {
          target: 'checking-cookie',
          actions: ['startLoading'],
        },
        START_LOGIN: {
          target: 'setting-cookie',
          actions: assign({
            hashedToken: ({ event }) => event.hashedToken,
          }),
        },
      },
      description: 'The user is currently logged out.',
    },
    'checking-cookie': {
      invoke: {
        id: 'checkAuth',
        src: 'authChecker',
        input: ({ context }) => ({
          baseUrl: context.baseUrl,
        }),
        onDone: {
          actions: [
            assign({
              hashedToken: ({ event }) => {
                return event.output.success ? event.output.hashedToken : '';
              },
              token: ({ event }) => {
                return event.output.success ? event.output.token : '';
              },
            }),
            raise(({ event }) => ({
              type: event.output.success ? 'CHECK_COOKIE' : 'COOKIE_INVALID',
            })),
          ],
        },
        onError: {
          target: 'logged-out',
          actions: ['stopLoading', 'checked'],
        },
      },
      on: {
        COOKIE_VALID: {
          target: 'logged-in',
          actions: ['stopLoading', 'checked'],
        },
        COOKIE_INVALID: {
          target: 'logged-out',
          actions: ['stopLoading', 'checked'],
        },
      },
    },
    'setting-cookie': {
      invoke: {
        id: 'cookieSetter',
        src: 'setCookie',
        input: ({ context }) => ({ token: context.hashedToken }),
        onDone: {
          target: 'logged-in',
          actions: assign({ token: ({ event }) => event.output }),
        },
        onError: {
          target: 'logged-out',
          actions: 'stopLoading',
        },
      },
    },
    'logged-in': {
      on: {
        LOGOUT: {
          target: 'logging-out',
        },
      },
      description: 'The user is currently logged in.',
    },
    'logging-out': {
      invoke: {
        id: 'cookieDeleter',
        src: 'deleteCookie',
        onDone: {
          target: 'logged-out',
          actions: assign({
            token: '',
            hashedToken: '',
          }),
        },
        onError: {
          target: 'logged-out',
          actions: assign({
            token: '',
            hashedToken: '',
          }),
        },
      },
    },
  },
});
