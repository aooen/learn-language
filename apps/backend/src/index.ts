import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

import collect from './routes/collect';
import user from './routes/user';
import wordlist from './routes/wordlist';
import words from './routes/words';
import mediaInfo from './routes/mediaInfo';
import quizSet from './routes/quizSet';
import findMean from './routes/findMean';
import type { Env } from './types/hono';


import './startup';

const app = new Hono<Env>()
  .use(cors())
  .use('*', async (c, next) => {
    // Skip JWT validation for user routes
    const path = c.req.path;
    if (path === '/user/login' || path === '/user/signup') {
      return await next();
    }

    // Apply JWT middleware for other routes
    return jwt({
      secret: process.env.JWT_SECRET!,
    })(c, next);
  })
  .use(async (c, next) => {
    // Only set userId and locale if JWT was processed
    if (c.get('jwtPayload')) {
      c.set('userId', c.get('jwtPayload').sub);
      c.set('locale', c.get('jwtPayload').targetLang);
    }
    await next();
  });

const routes = app
  .route('/collect', collect)
  .route('/user', user)
  .route('/wordlist', wordlist)
  .route('/words', words)
  .route('/mediaInfo', mediaInfo)
  .route('/quizSet', quizSet)
  .route('/findMean', findMean);
  

export type AppType = typeof routes;

export default app;
