export type UserInterpretEvents =
  | { type: 'SUBMIT' }
  | { type: 'UPDATE_TEXT'; text: string }
  | { type: 'UPDATE_LANGUAGE'; language: 'zh' | 'kr' };
