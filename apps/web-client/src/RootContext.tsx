import { createActorContext } from '@xstate/react';
import { machine } from './xstate/root-machine';

export const RootContext = createActorContext(machine, {
  input: {
    env: {
      BASE_URL: import.meta.env.BASE_URL,
      TARGET_ENV: import.meta.env.TARGET_ENV,
      CLIENT_ID_WEB: import.meta.env.CLIENT_ID_WEB,
    },
  },
});
