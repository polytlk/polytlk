import { assign, setup, enqueueActions } from "xstate";
import { fetchCookie, validateCookie, setCookie } from './promises'


export const machine = setup({
  types: {
    context: {} as {
      hashedToken: string
      token: string
      loading: boolean
      checked: boolean
      baseUrl: string
    },
    events: {} as { type: "LOGOUT" } | { type: "CHECK_COOKIE" } | { type: "START_LOGIN", hashedToken: string },
    children: {} as {
      'cookieFetcher': 'fetchCookie',
      'cookieValidator': 'validateCookie'
      'cookieSetter': 'setCookie'
    },
    input: {} as {
      baseUrl: string
    }
  },
  actions: {
    startLoading: assign({ loading: true }),
    stopLoading: assign({ loading: false }),
    checked: assign({checked: true})
  },
  actors: {
    fetchCookie,
    validateCookie,
    setCookie
  }
}).createMachine({
  context: ({ input }) => ({
      hashedToken: '',
      token: '',
      loading: false,
      checked: false,
      baseUrl: input.baseUrl
    }),
  id: "authentication",
  initial: "logged-out",
  states: {
    "logged-out": {
      entry: enqueueActions(({enqueue, context}) => {
        if(!context.checked) {
          enqueue.raise({ type: 'CHECK_COOKIE' })
        }
      }),
      on: {
        "CHECK_COOKIE": {
          target: "checking-cookie",
          actions: ['startLoading']
        },
        "START_LOGIN": {
          target: "setting-cookie",
          actions: assign({
            hashedToken: ({ event }) =>
              event.hashedToken
          })
        }
      },
      description: "The user is currently logged out.",
    },
    "checking-cookie": {
      "invoke": {
        id: "cookieFetcher",
        src: "fetchCookie",
        onDone: {
          target: 'validating-cookie',
          actions: assign({ hashedToken: ({ event }) => event.output })
        },
        onError: {
          target: 'logged-out',
          actions: ['stopLoading', 'checked']
        },
      }
    },
    "validating-cookie": {
      "invoke": {
        id: "cookieValidator",
        src: "validateCookie",
        input: ({ context, }) => ({ token: context.hashedToken, baseUrl: context.baseUrl }),
        onDone: {
          target: 'logged-in',
          actions: [assign({ token: ({ event }) => event.output }), 'stopLoading', 'checked']
        },
        onError: {
          target: 'logged-out',
          actions: ['stopLoading','checked']
        },
      }
    },
    "setting-cookie": {
      "invoke": {
        id: "cookieSetter",
        src: "setCookie",
        input: ({ context }) => ({ token: context.hashedToken }),
        onDone: {
          target: 'logged-in',
          actions: assign({ token: ({ event }) => event.output })
        },
        onError: {
          target: 'logged-out',
          actions: 'stopLoading'
        },
      }
    },
    "logged-in": {
      on: {
        LOGOUT: {
          target: "logged-out",
          actions: ({ context, event }) => {
            console.log("User clicked log out, transitioning to logged out.");
          },
        },
      },
      description: "The user is currently logged in.",
    },
  },
});

