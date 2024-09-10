
import { assign, setup} from 'xstate';

type eventType = { type: 'TASK_RECEIVED', taskId: string } | { type: 'SUBMIT' } | { type: 'UPDATE_LANGUAGE', language: 'zh' | 'kr' } | { type: 'UPDATE_TEXT', text: string } | { type: 'NEW_TASK' }

import { interpretationFetcher } from './promises'

export const machine = setup({
  types: {
    input: {} as {
      baseUrl: string;
      token: string;
    },
    context: {} as {
      language: 'zh' | 'kr'
      text: string
      loading: boolean
      inputError: string
      inputColor: 'light' | 'danger'
      taskId: string
      baseUrl: string
      token: string
    },
    events: {} as eventType,
    children: {} as {
      'fetcher': 'interpretationFetcher'
    },
  },
  guards: {
    isChinese: ({ context }) => context.language === 'zh',
  },
  actions: {
    setTaskId: assign({
      taskId: ({ context, event }) => event.type === "TASK_RECEIVED" ? event.taskId : context.taskId
    }),
    clearError: assign({ inputError: '', inputColor: 'light' }),
    setValidError: assign({
      inputError: 'Please enter valid Chinese',
      inputColor: 'danger',
    }),
    setApiError: assign({
      inputError: 'Something went wrong',
      inputColor: 'danger',
    }),
    // loading actions
    setLoading: assign({ loading: true }),
    resetLoading: assign({ loading: false }),
  },
  actors: {
    interpretationFetcher
  }

}).createMachine({
  id: 'task',
  initial: 'idle',
  context: ({ input }) => ({
    language: 'zh',
    text: '',
    taskId: '',
    inputError: '',
    inputColor: 'light',
    loading: false,
    baseUrl: input.baseUrl || '',
    token: input.token || ''
  }),
  states: {
    idle: {
      on: {
        SUBMIT: {
          guard: 'isChinese',
          target: 'loading',
          actions: 'setLoading'
        },
        UPDATE_LANGUAGE: {
          actions: [
            assign({ language: ({ event }) => event.language })
          ]
        },
        UPDATE_TEXT: {
          actions: [
            assign({ text: ({ event }) => event.text })
          ]
        }
      }
    },
    loading: {
      invoke: {
        id: "fetcher",
        src: "interpretationFetcher",
        input: ({ context }) => ({ taskId: context.taskId, baseUrl: context.baseUrl, text: context.text, token: context.token }),
        onDone: {
          target: 'completed',
          actions: ['setTaskId', 'clearError'],
        },
        onError: {
          target: 'idle',
          actions: ['setApiError']
        },
      }
    },
    completed: {
      on: {
        NEW_TASK: {
          target: 'idle',
          actions: ['resetLoading'],
        },
      },
    },
  }
})