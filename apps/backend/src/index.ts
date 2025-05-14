import { Hono } from 'hono';
import { cors } from 'hono/cors';

import collect from './routes/collect';
import user from './routes/user';
import mediaInfo from './routes/mediaInfo.ts' 
import type { Env } from './types/hono';

import './startup.ts';

const app = new Hono<Env>()
  .use(cors())
  .use(async (c, next) => {
    c.set('locale', 'en');
    await next();
  })
  .route('/collect', collect)
  .route('/user', user)
  .route('/mediaInfo',mediaInfo);
export type AppType = typeof app;

export default app;
