import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '~/utils/validator-wrapper';
import { wordTable } from '~/schemas/word';
import { db } from '~/utils/db';
import { eq, inArray } from 'drizzle-orm';
import type { Env } from '~/types/hono';
import natural from 'natural';

const app = new Hono<Env>()
  .get('/:wordlistId', async (c) => {
    const wordlistId = parseInt(c.req.param('wordlistId'), 10);
    const result = await db.select().from(wordTable).where(eq(wordTable.wordlistId, wordlistId));
    return c.json(result);
  })
  .post(
    '/delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number()),
      }),
    ),
    async (c) => {
      const { ids } = c.req.valid('json');
      await db.delete(wordTable).where(inArray(wordTable.id, ids));
      return c.json({ ok: true });
    },
  )
  .post(
    '/find',
    zValidator(
      'json',
      z.object({
        word: z.string(),
      }),
    ),
    async (c) => {
      const data = c.req.valid('json');
      const stemmer = natural.PorterStemmer;
      const processedWord = stemmer.stem(data.word.toLowerCase());

      const result = await db
        .select({
          koWord: wordTable.meaning,
          enWord: wordTable.word
        })
        .from(wordTable)
        .where(eq(wordTable.word, processedWord));

      const modifiedResult = result.map(item => ({
        ...item,
        enWord: data.word
      }));

      return c.json(modifiedResult);
    }
  );

export default app;

