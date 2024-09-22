import type { BaseAuthUrl } from '#allauth/urls';

import { assign, sendParent, setup } from 'xstate';

import { fetchConfig, fetchSession } from './promises';
import { ConfigResponseType, SessionResponseType } from './schema';

export const allAuthChecker = setup({
  types: {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    context: {} as {
      baseUrl: BaseAuthUrl;
      sessionValid: boolean;
      auth: SessionResponseType | undefined;
      config: ConfigResponseType | undefined;
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    children: {} as {
      sessionFetcher: 'fetchSession';
      configFetcher: 'fetchConfig';
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    input: '' as BaseAuthUrl,
  },
  actions: {},
  actors: {
    fetchSession,
    fetchConfig,
  },
}).createMachine({
  context: ({ input }) => ({
    baseUrl: input,
    auth: undefined,
    config: undefined,
    sessionValid: false,
  }),
  id: 'allauth-checker',
  initial: 'checking-session',
  states: {
    'checking-session': {
      invoke: {
        id: 'sessionFetcher',
        src: 'fetchSession',
        input: ({ context }) => context.baseUrl,
        onDone: {
          target: 'checking-config',
          actions: assign({ auth: ({ event }) => event.output }),
        },
        onError: {
          target: 'checking-config',
        },
      },
    },
    'checking-config': {
      invoke: {
        id: 'configFetcher',
        src: 'fetchConfig',
        input: ({ context }) => context.baseUrl,
        onDone: {
          target: 'checking-complete',
          actions: assign({ config: ({ event }) => event.output }),
        },
        onError: {
          target: 'checking-complete',
        },
      },
    },
    'checking-complete': {
      entry: [
        sendParent(({ context }) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          const type = context.auth?.meta.is_authenticated
            ? 'ALLAUTH_AUTHENTICATED'
            : 'ALLAUTH_UNAUTHENTICATED';

          return {
            type,
            payload: {
              auth: context.auth,
              config: context.config,
            },
          };
        }),
      ],
    },
  },
});
