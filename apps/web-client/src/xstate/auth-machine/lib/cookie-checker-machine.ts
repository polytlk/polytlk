import { assign, sendParent, setup } from 'xstate';

import {
  deleteCookie,
  fetchCookie,
  setCookie,
  validateCookie,
} from './promises';

export const authChecker = setup({
  types: {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    context: {} as {
      hashedToken: string;
      token: string;
      baseUrl: string;
      success: boolean;
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    children: {} as {
      cookieFetcher: 'fetchCookie';
      cookieValidator: 'validateCookie';
      cookieSetter: 'setCookie';
      cookieDeleter: 'deleteCookie';
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    input: {} as {
      baseUrl: string;
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    output: {} as
      | { success: false }
      | { success: true; hashedToken: string; token: string },
  },
  actions: {
    invalidateCookie: assign({ success: false }),
  },
  actors: {
    fetchCookie,
    validateCookie,
    setCookie,
    deleteCookie,
  },
}).createMachine({
  context: ({ input }) => ({
    hashedToken: '',
    token: '',
    baseUrl: input.baseUrl,
    success: false,
  }),
  id: 'auth-checker',
  initial: 'checking-cookie',
  states: {
    'checking-cookie': {
      invoke: {
        id: 'cookieFetcher',
        src: 'fetchCookie',
        onDone: {
          target: 'validating-cookie',
          actions: assign({ hashedToken: ({ event }) => event.output }),
        },
        onError: {
          target: 'checking-complete',
          actions: 'invalidateCookie',
        },
      },
    },
    'validating-cookie': {
      invoke: {
        id: 'cookieValidator',
        src: 'validateCookie',
        input: ({ context }) => ({
          token: context.hashedToken,
          baseUrl: context.baseUrl,
        }),
        onDone: {
          target: 'checking-complete',
          actions: assign({
            token: ({ event }) => event.output,
            success: true,
          }),
        },
        onError: {
          target: 'checking-complete',
          actions: 'invalidateCookie',
        },
      },
    },
    'checking-complete': {
      entry: [
        sendParent(({ context }) => {
          return context.success
            ? {
                type: 'COOKIE_VALID',
                payload: {
                  hashedToken: context.hashedToken,
                  token: context.token,
                },
              }
            : { type: 'COOKIE_INVALID' };
        }),
      ],
    },
  },
});
