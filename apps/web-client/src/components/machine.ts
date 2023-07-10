import type { MachineContext, MachineEvents } from './types'

import { assign,createMachine } from "xstate";

export const machine = createMachine<MachineContext, MachineEvents>({
    id: "task",
    initial: "idle",
    context: {
        language: "zh",
        text: "",
        taskId: "",
        inputError: "",
        inputColor: "light",
        loading: false,
    },
    states: {
        idle: {
            on: {
                SUBMIT: [
                    {
                        target: "loading",
                        cond: "isChinese",
                        actions: ["submitChinese", "setLoading"],
                    },
                    { target: "idle", actions: "setError" },
                ],
                UPDATE_LANGUAGE: {
                    actions: assign({ language: (_, event) => event.language }),
                },
                UPDATE_TEXT: {
                    actions: assign({ text: (_, event) => event.text }),
                },
            },
        },
        loading: {
            on: {
                TASK_RECEIVED: {
                    target: "completed",
                    actions: ["setTaskId", "clearError"],
                },
            },
        },
        completed: {
            on: {
                NEW_TASK: {
                    target: "idle",
                    actions: ["resetLoading"],
                },
            },
        },
    },
});
