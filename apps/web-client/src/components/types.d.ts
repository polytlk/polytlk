/* eslint-disable @typescript-eslint/ban-types */
import { Interpreter } from 'xstate';

export interface TaskStateSchema extends StateSchema {
    states: {
        idle: {};
        loading: {};
        completed: {};
    };
}

type MachineEvents =
    | { type: 'SUBMIT' }
    | { type: 'UPDATE_LANGUAGE'; language: string }
    | { type: 'UPDATE_TEXT'; text: string }
    | { type: 'TASK_RECEIVED'; taskId: string }
    | { type: 'NEW_TASK' };

interface MachineContext {
    language: string,
    text: string,
    taskId: string,
    inputError: string,
    inputColor: string,
    loading: boolean
}

export type MachineService = Interpreter<MachineContext, any, MachineEvents, any>;
