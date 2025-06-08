import { Hono } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '~/utils/validator-wrapper';
import { wordTable } from '~/schemas/word';
import { wordlistTable } from '~/schemas/wordlist';
import { db } from '~/utils/db';
import { sanitizeWord } from '~/utils/stem';
import type { Env } from '~/types/hono';
import { cacheStemTable } from '~/schemas/cacheStem';

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
      const userId = c.get('userId');
      const { ids } = c.req.valid('json');
      await db
        .delete(wordTable)
        .where(
          and(
            inArray(wordTable.id, ids),
            inArray(
              wordTable.wordlistId,
              db
                .select({ wordlistId: wordlistTable.id })
                .from(wordlistTable)
                .where(eq(wordlistTable.userId, userId)),
            ),
          ),
        );
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
      const word = sanitizeWord(data.word);

      const result = await db
        .select({
          koWord: wordTable.meaning,
          enWord: wordTable.word,
        })
        .from(wordTable)
        .where(
          and(
            eq(
              wordTable.word,
              db
                .select({ stem: cacheStemTable.stem })
                .from(cacheStemTable)
                .where(and(eq(cacheStemTable.language, 'en-US'), eq(cacheStemTable.word, word))),
            ),
            eq(wordTable.wordlistId, Number(data.wordlistId)),
          ),
        );

      return c.json(result);
    },
  );

export default app;
