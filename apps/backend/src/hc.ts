import type { AppType } from './index';
import { hc } from 'hono/client';

// assign the client to a variable to calculate the type when compiling
const client = hc<AppType>('');
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args);
