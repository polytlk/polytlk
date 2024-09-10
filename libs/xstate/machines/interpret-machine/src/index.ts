import { type EventFromLogic } from 'xstate';
import { machine } from './lib/interpret-machine';

type InterpretEvents = EventFromLogic<typeof machine>;

export { machine };
export type { InterpretEvents };
