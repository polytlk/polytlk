import { authHandlers } from './handlers/auth';
import { chineseHandlers } from './handlers/chinese';

export const handlers = [...authHandlers, ...chineseHandlers];
