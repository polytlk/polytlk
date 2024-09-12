import { type EventFromLogic } from 'xstate';

import { type ariData } from './lib/actors/observables';
import { type InterpretContext } from './lib/interpret-machine';
import { machine } from './lib/interpret-machine';

type InterpretEvents = EventFromLogic<typeof machine>;

export { machine };
export type { ariData, InterpretContext, InterpretEvents };
