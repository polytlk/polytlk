import type { AuthEvents } from 'auth-machine';
import type {
  ariData,
  errorMessages,
  InternalInterpretEvents,
  InterpretContext,
} from 'interpret-machine';
import type { UserInterpretEvents } from './types';
import type { EnvType } from './env-schema'

import { authChecker, deleteCookie, setCookie } from 'auth-machine';
import { machine as interpretMachine } from 'interpret-machine';
import { assign, raise, setup } from 'xstate';
import { getConfig } from './actors';

export const machine = setup({
  types: {
    context: {} as {
      env: unknown;
      config:  EnvType;
      platform: "ios" | "web" | "android";
      isVirtual: boolean;
      hashedToken: string;
      token: string;
      loading: boolean;
      checked: boolean;
      interpret: Omit<InterpretContext, 'token' | 'baseUrl' | 'inputError'> & {
        inputError: errorMessages | '';
      }
    },
    events: {} as AuthEvents | UserInterpretEvents | InternalInterpretEvents,
    children: {} as {
      machineInterpreter: 'interpretMachine';
      checkAuth: 'authChecker';
      cookieDeleter: 'deleteCookie';
      cookieSetter: 'setCookie';
      configGetter: 'getConfig';
    },
    input: {} as {
      env: unknown
      platform?: "web" | "ios" | "android"
      taskIds?: string[];
      results?: Record<string, ariData>;
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
    getConfig
  },
}).createMachine({
  context: ({ input }) => ({
    env: input.env,
    config: {
      TARGET_ENV: "local",
      BASE_URL: "http://localhost:8080",
      CLIENT_ID_WEB: "540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com",
    },
    platform: input.platform || "web",
    isVirtual: false,
    hashedToken: '',
    token: '',
    loading: false,
    checked: false,
    interpret: {
      text: '',
      language: 'zh',
      taskId: '',
      taskIds: input.taskIds || [],
      inputError: '',
      inputColor: 'light',
      loading: false,
      results: input.results || {},
    },
  }),
  id: 'root',
  initial: 'loading',
  states: {
    'loading': {
      invoke: {
        id: 'configGetter',
        src: 'getConfig',
        input: ({context}) => ({env: context.env}),
        onDone: {
          target: 'logged-out',
          actions: assign({config: ({event}) => event.output.config, platform: ({event}) => event.output.platform, isVirtual: ({event}) => event.output.isVirtual})
        },
        onError: {
          actions: ({event}) => {
            console.log("event", event)
            console.log("fatal config error occured")
          }
        }
      }
    },
    'logged-out': {
      initial: 'checking-cookie',
      states: {
        'checking-cookie': {
          invoke: {
            id: 'checkAuth',
            src: 'authChecker',
            input: ({ context }) => ({
              baseUrl: context.config.BASE_URL,
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
                baseUrl: context.config.BASE_URL,
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
