import { Hono } from 'hono';
import { cors } from 'hono/cors';

import collect from './routes/collect';
import user from './routes/user';
import wordlist from './routes/wordlist';
import words from './routes/words';
import mediaInfo from './routes/mediaInfo';
import quizSet from './routes/quizSet';
import type { Env } from './types/hono';

import './startup';

const app = new Hono<Env>().use(cors()).use(async (c, next) => {
  c.set('locale', 'en');
  await next();
});

const routes = app
  .route('/collect', collect)
  .route('/user', user)
  .route('/wordlist', wordlist)
  .route('/words', words)
  .route('/mediaInfo', mediaInfo)
  .route('/quizSet', quizSet);

export type AppType = typeof routes;

export default app;
