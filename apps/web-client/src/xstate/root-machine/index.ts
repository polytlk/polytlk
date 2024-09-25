import type { UserInterpretEvents } from './lib/types';

//import { createBrowserInspector } from '@statelyai/inspect';
import { createActorContext } from '@xstate/react';

import { machine } from './lib/machine';

//const { inspect } = createBrowserInspector();

const { useActorRef, useSelector, Provider } = createActorContext(machine, {
  //inspect,
  input: {
    env: {
      BASE_URL: import.meta.env.BASE_URL,
      TARGET_ENV: import.meta.env.TARGET_ENV,
      CLIENT_ID_WEB: import.meta.env.CLIENT_ID_WEB,
    },
  },
});

export { Provider, useActorRef, useSelector };
export type { UserInterpretEvents };
