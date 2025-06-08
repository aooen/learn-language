import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';

import { quizTable } from '~/schemas/quiz';
import { quizSetTable } from '~/schemas/quizSet';
import { wordTable } from '~/schemas/word';
import { db } from '~/utils/db';
import { zValidator } from '~/utils/validator-wrapper';
import type { Env } from '~/types/hono';
import { quizSetLogTable } from '~/schemas/quizSetLog';

// TODO: move to shared
const Quiz = z.object({
  id: z.number(),
  front: z.string(),
  back: z.string(),
  progress: z.number(),
  sentenceFrom: z.string(),
  due: z.number(),
  quizSetId: z.number(),
});

const app = new Hono<Env>()
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const quizSetId = c.req.param('id');
    try {
      const { count: quizSetCount } = (
        await db
          .select({ count: count() })
          .from(quizSetTable)
          .where(and(eq(quizSetTable.id, Number(quizSetId)), eq(quizSetTable.maker, userId)))
      )[0]!;

      if (quizSetCount === 0) {
        throw new Error();
      }

      let quizs = await db
        .select()
        .from(quizTable)
        .where(eq(quizTable.quizSetId, Number(quizSetId)));
      return c.json(quizs);
    } catch {}
    throw new HTTPException(404, { message: 'Not found quizSet' });
  })
  .put('/:id', zValidator('json', z.array(Quiz)), async (c) => {
    const userId = c.get('userId');
    const quizSetId = c.req.param('id');
    const data = c.req.valid('json');
    try {
      const { count: quizSetCount } = (
        await db
          .select({ count: count() })
          .from(quizSetTable)
          .where(and(eq(quizSetTable.id, Number(quizSetId)), eq(quizSetTable.maker, userId)))
      )[0]!;

      if (quizSetCount === 0) {
        throw new Error();
      }

      for (const q of data) {
        await db
          .update(quizTable)
          .set({ progress: q.progress, due: q.due })
          .where(eq(quizTable.id, q.id));
        await db.insert(quizSetLogTable).values({
          quizSetId: q.quizSetId,
          studyDate: new Date(),
          learnedQuizId: q.id,
        });
      }
      return c.json({ success: true });
    } catch {}
    throw new HTTPException(404, { message: 'Not found quizId' });
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const quizSetId = c.req.param('id');
    try {
      await db
        .delete(quizSetTable)
        .where(and(eq(quizSetTable.id, Number(quizSetId)), eq(quizSetTable.maker, userId)));
      return c.json({ success: true });
    } catch {}
    throw new HTTPException(404, { message: 'Not found quizId' });
  })
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        wordlistId: z.number(),
      }),
    ),
    async (c) => {
      const { wordlistId } = c.req.valid('json');
      const userId = c.get('userId');
      if (!wordlistId || !userId) {
        throw new HTTPException(400, { message: 'wordlistId and userId are required' });
      }
      // Check if the wordlist exists for the user
      try {
        const quizSetIds = await db
          .insert(quizSetTable)
          .values({ wordlistId: wordlistId, maker: userId })
          .$returningId();

        const quizSetId = quizSetIds[0]?.id;

        const words = await db.select().from(wordTable).where(eq(wordTable.wordlistId, wordlistId));

        if (quizSetId !== undefined) {
          const inputQuizSet = words
            .filter((word) => word.meaning)
            .map((word) => ({
              front: word.word, // or word.word, adjust as needed
              back: word.meaning!, // or word.meaning, adjust as needed
              progress: 0,
              sentenceFrom: '',
              due: 0,
              quizSetId: quizSetId,
            }));
          if (words.length > 0) {
            await db.insert(quizTable).values(inputQuizSet);
          }
        }

        return c.json({ success: true, quizSetId: quizSetId });
      } catch (err) {
        throw new HTTPException(500, { message: 'Failed to create quiz set' });
      }
    },
  )
  .get('/', async (c) => {
    const userId = c.get('userId');
    if (!userId) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    try {
      const quizSets = await db.select().from(quizSetTable).where(eq(quizSetTable.maker, userId));
      return c.json(quizSets);
    } catch (err) {
      throw new HTTPException(500, { message: 'Failed to fetch quiz sets' });
    }
  });

export default app;
