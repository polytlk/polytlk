import type { AllAuthEvents } from '../../allauth-machine';
import type { AuthEvents } from '../../auth-machine';
import type {
  ariData,
  errorMessages,
  InternalInterpretEvents,
  InterpretContext,
} from '../../interpret-machine';
import type { EnvType } from './env-schema';
import type { UserInterpretEvents } from './types';

import { getBaseAuthUrl } from '#allauth/urls';
import {
  ConfigResponseType,
  SessionResponseType,
} from 'src/xstate/allauth-machine/lib/schema';
import { assign, setup } from 'xstate';

import { allAuthChecker } from '../../allauth-machine';
import { deleteSession } from '../../allauth-machine/lib/promises';
import { authChecker, deleteCookie, setCookie } from '../../auth-machine';
import { machine as interpretMachine } from '../../interpret-machine';
import { queriesFetcher } from '../../interpret-machine/lib/actors/promises';
import { getConfig } from './actors';

export const machine = setup({
  types: {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    context: {} as {
      env: unknown;
      config: EnvType;
      platform: 'ios' | 'web' | 'android';
      isVirtual: boolean;
      hashedToken: string;
      token: string;
      loading: boolean;
      checked: boolean;
      allauth: {
        auth: SessionResponseType | undefined;
        config: ConfigResponseType | undefined;
      };
      interpret: Omit<InterpretContext, 'token' | 'baseUrl' | 'inputError'> & {
        inputError: errorMessages | '';
      };
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    events: {} as
      | AuthEvents
      | UserInterpretEvents
      | InternalInterpretEvents
      | AllAuthEvents,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    children: {} as {
      machineInterpreter: 'interpretMachine';
      checkAuth: 'authChecker';
      cookieDeleter: 'deleteCookie';
      cookieSetter: 'setCookie';
      configGetter: 'getConfig';
      checkAllAuth: 'allAuthChecker';
      sessionDelete: 'deleteSession';
      fetchQueries: 'queriesFetcher';
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    input: {} as {
      env: unknown;
      platform?: 'web' | 'ios' | 'android';
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
    allAuthChecker,
    deleteCookie,
    setCookie,
    getConfig,
    deleteSession,
    queriesFetcher
  },
}).createMachine({
  context: ({ input }) => ({
    env: input.env,
    config: {
      TARGET_ENV: 'local',
      BASE_URL: 'http://localhost',
      CLIENT_ID_WEB:
        '540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com',
    },
    platform: input.platform !== undefined ? input.platform : 'web',
    isVirtual: false,
    hashedToken: '',
    token: '',
    loading: false,
    checked: false,
    allauth: {
      auth: undefined,
      config: undefined,
    },
    interpret: {
      text: '',
      language: 'zh',
      taskId: '',
      taskIds: input.taskIds !== undefined ? input.taskIds : [],
      inputError: '',
      inputColor: 'light',
      loading: false,
      results: input.results !== undefined ? input.results : {},
    },
  }),
  id: 'root',
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        id: 'configGetter',
        src: 'getConfig',
        input: ({ context }) => ({ env: context.env }),
        onDone: {
          target: 'logged-out',
          actions: assign({
            config: ({ event }) => event.output.config,
            platform: ({ event }) => event.output.platform,
            isVirtual: ({ event }) => event.output.isVirtual,
          }),
        },
        onError: {
          actions: ({ event }) => {
            console.log('event', event);
            console.log('fatal config error occured');
          },
        },
      },
    },
    'logged-out': {
      // initial: 'checking-cookie',
      initial: 'checking-allauth',
      states: {
        //'checking-cookie': {
        //  invoke: {
        //    id: 'checkAuth',
        //    src: 'authChecker',
        //    input: ({ context }) => ({
        //      baseUrl: context.config.BASE_URL,
        //    }),
        //    onError: {
        //      actions: [raise({ type: 'COOKIE_INVALID' })],
        //    },
        //  },
        //  on: {
        //    COOKIE_VALID: {
        //      target: 'done',
        //      actions: [
        //        assign({
        //          hashedToken: ({ event }) => event.payload.hashedToken,
        //          token: ({ event }) => event.payload.token,
        //        }),
        //        'stopLoading',
        //        'checked',
        //      ],
        //    },
        //    COOKIE_INVALID: {
        //      target: 'idle',
        //      actions: ['stopLoading', 'checked'],
        //    },
        //  },
        //},
        'checking-allauth': {
          invoke: {
            id: 'checkAllAuth',
            src: 'allAuthChecker',
            input: ({ context }) => {
              const { config, platform } = context;

              const baseAuthUrl = getBaseAuthUrl({ baseUrl: config.BASE_URL, platform });

              return { baseAuthUrl, baseUrl: context.config.BASE_URL }
            },
            // onError: {
            //   actions: [raise(() => {})],
            // },
          },
          on: {
            ALLAUTH_AUTHENTICATED: {
              target: 'done',
              actions: [
                assign({
                  allauth: ({ event }) => ({
                    auth: event.payload.auth,
                    config: event.payload.config,
                  }),
                  token: ({ event }) => event.payload.token
                }),
              ],
            },
            ALLAUTH_UNAUTHENTICATED: {
              target: 'idle',
              actions: [
                assign({
                  allauth: ({ event }) => ({
                    auth: event.payload.auth,
                    config: event.payload.config,
                  }),
                }),
              ],
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
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            id: "fetchQueries",
            src: "queriesFetcher",
            input: ({ context }) => {
              return {
                token: context.token,
                baseUrl: context.config.BASE_URL
              };
            },
            onDone: {
              target: 'ready',
              actions: [
                assign({
                  interpret: ({ context, event }) => {
                    const base = {
                      ...context.interpret,
                      results: {
                        ...context.interpret.results,
                      },
                      taskIds: [...context.interpret.taskIds],
                    }

                    for (const key in event.output){
                      base.results[key] = event.output[key]
                      base.taskIds = [...base.taskIds, key]
                    }

                    return base
                  },
                }),
              ],
            }
          }
        },
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
            id: 'sessionDelete',
            src: 'deleteSession',
            input: ({ context }) => {
              const { config, platform } = context;

              return getBaseAuthUrl({ baseUrl: config.BASE_URL, platform });
            },
            onDone: {
              target: 'done',
              actions: assign({
                token: '',
                hashedToken: '',
                allauth: {
                  auth: undefined,
                  config: undefined,
                },
              }),
            },
            onError: {
              target: 'done',
              actions: assign({
                token: '',
                hashedToken: '',
                allauth: {
                  auth: undefined,
                  config: undefined,
                },
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
