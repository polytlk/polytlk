import { createActorContext } from '@xstate/react';
import { machine } from 'xstate/machines/root-machine';

//const { inspect } = createBrowserInspector();

export const RootContext = createActorContext(machine, {
  // inspect: (event) => console.log(event),
  input: { baseUrl: import.meta.env.BASE_URL },
});
