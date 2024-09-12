// import { createBrowserInspector } from '@statelyai/inspect';
import { createActorContext } from '@xstate/react';
import { machine } from 'xstate/machines/root-machine';

// const { inspect } = createBrowserInspector();

export const RootContext = createActorContext(machine, {
  // inspect,
  // inspect: (event) => console.log(event),
  // HACK: to get storybook to work safeguard this called to base url
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  input: { baseUrl: import.meta?.env?.BASE_URL },
});
