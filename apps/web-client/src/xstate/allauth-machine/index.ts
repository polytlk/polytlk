import type { ConfigResponseType, SessionResponseType } from './lib/schema';

export * from './lib/allauth-checker-machine';

export type AllAuthEvents =
  | {
      type: 'ALLAUTH_AUTHENTICATED';
      payload: {
        auth: SessionResponseType;
        config: ConfigResponseType;
        token: string;
      };
    }
  | {
      type: 'ALLAUTH_UNAUTHENTICATED';
      payload: {
        auth: SessionResponseType;
        config: ConfigResponseType;
      };
    };
