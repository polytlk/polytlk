/* eslint-disable @typescript-eslint/ban-types */
import { Interpreter } from 'xstate';

export type TaskStateSchema = {
  states: {
    idle: {};
    loading: {};
    completed: {};
  };
} & StateSchema;

type MachineEvents =
  | { type: 'SUBMIT' }
  | { type: 'UPDATE_LANGUAGE'; language: 'zh' | 'kr' }
  | { type: 'UPDATE_TEXT'; text: string }
  | { type: 'TASK_RECEIVED'; taskId: string }
  | { type: 'NEW_TASK' };

type MachineContext = {
  language: 'zh' | 'kr';
  text: string;
  taskId: string;
  inputError: string;
  inputColor: string;
  loading: boolean;
};

export type MachineService = Interpreter<
  MachineContext,
  unknown,
  MachineEvents,
  unknown
>;
