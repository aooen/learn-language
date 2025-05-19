import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { quizTable } from '~/schemas/quiz';
import { db } from '~/utils/db';
import { zValidator } from '~/utils/validator-wrapper';
import type { Env } from '~/types/hono';

// TODO: move to shared
const Quiz = z.object({
  id: z.number(),
  front: z.string(),
  back: z.string(),
  progress: z.number(),
  sentence_from: z.string(),
  due: z.number(),
});

const app = new Hono<Env>()
  .get('/:id', async (c) => {
    const quizSetId = c.req.param('id');
    try {
      let quizs = await db
        .select()
        .from(quizTable)
        .where(eq(quizTable.quizSetId, Number(quizSetId)));
      return c.json(quizs);
    } catch {}
    throw new HTTPException(404, { message: 'Not found quizSet' });
  })
  .put('/:id', zValidator('json', z.array(Quiz)), async (c) => {
    const data = c.req.valid('json');
    try {
      for (const q of data) {
        await db
          .update(quizTable)
          .set({ progress: q.progress, due: q.due })
          .where(eq(quizTable.id, q.id));
      }
      return c.json({ success: true });
    } catch {}
    throw new HTTPException(404, { message: 'Not found quizId' });
  });

export default app;
