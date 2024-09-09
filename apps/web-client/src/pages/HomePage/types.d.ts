/* eslint-disable @typescript-eslint/ban-types */
import { Interpreter } from 'xstate';

export type MachineService = Interpreter<
  MachineContext,
  unknown,
  MachineEvents,
  unknown
>;
