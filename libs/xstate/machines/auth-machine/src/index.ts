export * from './lib/cookie-checker-machine';
export * from './lib/promises';

export type AuthEvents =
  | { type: 'LOGOUT' }
  | {
      type: 'COOKIE_VALID';
      payload: { hashedToken: string; token: string };
    }
  | { type: 'COOKIE_INVALID' }
  | { type: 'START_LOGIN'; hashedToken: string };
