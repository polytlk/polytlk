import { createBrowserInspector } from '@statelyai/inspect';
import { createActorContext } from '@xstate/react';
import { machine } from 'auth-machine';

const { inspect } = createBrowserInspector();

export const AuthContext = createActorContext(machine, {
  inspect,
  input: { baseUrl: import.meta.env.BASE_URL },
});
