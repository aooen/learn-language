import { Hono } from 'hono';
import { db } from '../db/client.ts';
import { wordlist } from '../schemas/wordlist';
import { eq, and } from 'drizzle-orm';

const wordlistRoute = new Hono();

// 단어장 목록 조회
wordlistRoute.get('/', async (c) => {
  const userId = 1; // 임시 사용자 ID
  const result = await db.select().from(wordlist).where(eq(wordlist.userId, userId));
  return c.json(result);
});

// 단어장 추가
wordlistRoute.post('/', async (c) => {
  const body = await c.req.json();
  const { word, meaning } = body;
  const userId = 1;

  await db.insert(wordlist).values({ word, meaning, userId });
  return c.json({ success: true });
});

// 단어 삭제
wordlistRoute.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const userId = 1;

  const result = await db
    .delete(wordlist)
    .where(and(eq(wordlist.id, id), eq(wordlist.userId, userId)));

  return c.json({ success: true });
});

export default wordlistRoute;
