import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import * as schemas from '~/schemas';
import { zValidator } from '~/utils/validator-wrapper';
import { db } from '~/utils/db';
import type { Env } from '~/types/hono';
import { AwsDataApiPgDatabase } from 'drizzle-orm/aws-data-api/pg';

const app = new Hono<Env>().get(
  '/:id',
  async (c) => {
    // const body = await c.req.json();
    const quizSetId = c.req.param('id');
try {
    let quizs = await db.select().from(schemas.quiz).where(eq(schemas.quiz.quizSet, quizSetId));
    return c.json(quizs);
} catch {
}
throw new HTTPException(404, { message: 'Not found quizSet' });
}
).put('/:id', async(c) => {
  const body = await c.req.json();
  try {
    for (const quiz of body) {
      console.log(quiz);
      await db.update(schemas.quiz).set( { progress : quiz.progress, due : quiz.due }).where(eq(schemas.quiz.id, quiz.id));
      return c.text("Accepted");
    }
  } catch {}
  throw new HTTPException(404, {message: 'Not found quizId'});
});

export default app;
