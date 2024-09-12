import { type EventFromLogic } from 'xstate';

import { type InterpretContext } from './lib/interpret-machine';
import { machine } from './lib/interpret-machine';

type InterpretEvents = EventFromLogic<typeof machine>;

export { machine };
export type { InterpretContext, InterpretEvents };
