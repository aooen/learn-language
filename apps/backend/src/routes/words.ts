import { Hono } from 'hono';
import natural from 'natural';
import { z } from 'zod';
import { zValidator } from '~/utils/validator-wrapper';
import { wordTable } from '~/schemas/word';
import { db } from '~/utils/db';
import { and, eq, inArray } from 'drizzle-orm';
import type { Env } from '~/types/hono';

const stemmer = natural.PorterStemmer;

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
        wordlistId: z.string(),
        word: z.string(),
      }),
    ),
    async (c) => {
      const data = c.req.valid('json');
      const processedWord = stemmer.stem(data.word.replace(/[^a-zA-Z]/g, '').toLowerCase());

      const result = await db
        .select({
          koWord: wordTable.meaning,
          enWord: wordTable.word,
        })
        .from(wordTable)
        .where(
          and(eq(wordTable.word, processedWord), eq(wordTable.wordlistId, Number(data.wordlistId))),
        );

      const modifiedResult = result.map((item) => ({
        ...item,
        enWord: data.word,
      }));

      return c.json(modifiedResult);
    },
  );

export default app;
