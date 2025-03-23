import type { AppType } from 'backend';
import { hc } from 'hono/client';

export const client = hc<AppType>(import.meta.env.VITE_API_URL);
