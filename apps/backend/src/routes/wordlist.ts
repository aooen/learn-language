import { Hono } from 'hono';
import type { Env } from '../types/hono.ts';
import { db } from '~/utils/db';
import { wordlistTable } from '../schemas/wordlist';
import { eq, and } from 'drizzle-orm';

const app = new Hono<Env>()
  // 단어장 목록 조회
  .get('/', async (c) => {
    const userId = c.get('userId');
    const result = await db.select().from(wordlistTable).where(eq(wordlistTable.userId, userId));
    return c.json(result);
  })

  // 단어장 조회
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    const result = await db
      .select()
      .from(wordlistTable)
      .where(and(eq(wordlistTable.id, id), eq(wordlistTable.userId, userId)));
    const row = result[0]!;
    return c.json(row);
  })

  // 단어장 추가
  .post('/', async (c) => {
    const body = await c.req.json();
    const { title } = body;
    const userId = c.get('userId');

    await db.insert(wordlistTable).values({ title, userId });
    return c.json({ success: true });
  })

  // 단어장 삭제
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');

    const [{ affectedRows }] = await db
      .delete(wordlistTable)
      .where(and(eq(wordlistTable.id, id), eq(wordlistTable.userId, userId)));

    return c.json({ success: affectedRows > 0 });
  });

export default app;
