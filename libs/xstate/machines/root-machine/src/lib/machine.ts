import { setup } from 'xstate';

export const machine = setup({
  types: {
    context: {} as { token: string; baseUrl: string },
    events: {} as { type: 'CHECK' } | { type: 'LOGIN' } | { type: 'LOGOUT' },
    input: {} as {
      baseUrl: string;
    },
  },
}).createMachine({
  context: ({ input }) => ({
    token: '',
    baseUrl: input.baseUrl,
  }),
  id: 'root',
  initial: 'loggedOut',
  states: {
    loggedOut: {
      initial: 'unchecked',
      description: 'The user is currently logged out.',
      states: {
        unchecked: {
          on: {
            CHECK: {
              target: 'checked',
            },
          },
          description:
            'The initial state when logged out, where the user has not been checked for any authentication status.',
        },
        checked: {
          on: {
            LOGIN: {
              target: 'ready',
            },
          },
          description:
            'The state when logged out and the user authentication status has been checked.',
        },
        ready: {
          type: 'final',
        },
      },
      onDone: {
        target: 'loggedIn',
      },
    },
    loggedIn: {
      on: {
        LOGOUT: {
          target: 'loggedOut',
        },
      },
      description: 'The user is currently logged in.',
    },
  },
});
