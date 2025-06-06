import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Env } from '~/types/hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '~/utils/db';
import { subtitleTable } from '~/schemas/subtitle';
import { wordlistTable } from '~/schemas/wordlist';

const app = new Hono<Env>().get('/:wordlistId', async (c) => {
  const wordlistId = Number(c.req.param('wordlistId'));

  let result = await db
    .select()
    .from(subtitleTable)
    .innerJoin(wordlistTable, eq(subtitleTable.wordlistId, wordlistTable.id))
    .where(eq(wordlistTable.id, wordlistId))
    .orderBy(subtitleTable.startTime);

  if (result.length === 0) {
    throw new HTTPException(400, { message: '유효하지 않은 URL입니다.' });
  }

  return c.json(result.map(({ subtitle }) => subtitle));
});

export default app;
