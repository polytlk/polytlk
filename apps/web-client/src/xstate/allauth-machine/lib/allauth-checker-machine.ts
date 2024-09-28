import type { BaseAuthUrl } from '#allauth/urls';
import type { BaseUrlType } from '#rootmachine/lib/env-schema';


import { assign, sendParent, setup } from 'xstate';

import { fetchConfig, fetchSession } from './promises';
import { fetchToken } from './custom-promises';
import { ConfigResponseType, SessionResponseType } from './schema';

export const allAuthChecker = setup({
  types: {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    context: {} as {
      baseUrl: BaseUrlType;
      baseAuthUrl: BaseAuthUrl;
      token: string;
      auth: SessionResponseType | undefined;
      config: ConfigResponseType | undefined;
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    children: {} as {
      sessionFetcher: 'fetchSession';
      configFetcher: 'fetchConfig';
      tokenFetcher: 'fetchToken';
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    input: {} as {
      baseAuthUrl: BaseAuthUrl;
      baseUrl: BaseUrlType;
    },
  },
  actions: {},
  actors: {
    fetchSession,
    fetchConfig,
    fetchToken
  },
}).createMachine({
  context: ({ input }) => ({
    baseUrl: input.baseUrl,
    baseAuthUrl: input.baseAuthUrl,
    auth: undefined,
    config: undefined,
    token: ''
  }),
  id: 'allauth-checker',
  initial: 'checking-session',
  states: {
    'checking-session': {
      invoke: {
        id: 'sessionFetcher',
        src: 'fetchSession',
        input: ({ context }) => context.baseAuthUrl,
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
        input: ({ context }) => context.baseAuthUrl,
        onDone: {
          target: 'checking-token',
          actions: assign({ config: ({ event }) => event.output }),
        },
        onError: {
          target: 'checking-token',
        },
      },
    },
    'checking-token': {
      invoke: {
        id: 'tokenFetcher',
        src: 'fetchToken',
        input: ({ context }) => context.baseUrl,
        onDone: {
          target: 'checking-complete',
          actions: assign({ token: ({ event }) => event.output }),
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
          const isAuth = context.auth?.meta.is_authenticated && context.token !== ''
          const basePayload = {auth: context.auth, config: context.config};

          const type = isAuth ? 'ALLAUTH_AUTHENTICATED' : 'ALLAUTH_UNAUTHENTICATED';

          const payload = isAuth ? {...basePayload, token: context.token } : basePayload;

          return {
            type,
            payload
          };
        }),
      ],
    },
  },
});
