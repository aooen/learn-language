import { Hono } from 'hono';
import type { Env } from '../types/hono.ts';
import { db } from '~/utils/db';
import { wordlist } from '../schemas/wordlist';
import { eq, and } from 'drizzle-orm';

const app = new Hono<Env>()
  // 단어장 목록 조회
  .get('/', async (c) => {
    const userId = 1; // 임시 ID 설정
    const result = await db.select().from(wordlist).where(eq(wordlist.userId, userId));
    return c.json(result);
  })

  // 단어장 추가
  .post('/', async (c) => {
    const body = await c.req.json();
    const { title } = body;
    const userId = 1;

    await db.insert(wordlist).values({ title, userId });
    return c.json({ success: true });
  })

  // 단어장 삭제
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const userId = 1;

    const [{ affectedRows }] = await db
      .delete(wordlist)
      .where(and(eq(wordlist.id, id), eq(wordlist.userId, userId)));

    return c.json({ success: affectedRows > 0 });
  });

export default app;
