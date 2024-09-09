export type MachineEvents =
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
