import { Hono } from 'hono';
import { z } from 'zod';
import { verify } from 'hono/jwt';
import { db } from '~/utils/db';
import { friendsTable } from '~/schemas/friends';
import { userTable } from '~/schemas/user';
import { zValidator } from '~/utils/validator-wrapper';
import { eq, and } from 'drizzle-orm';

const app = new Hono();

async function getUserIdFromToken(c: any): Promise<number | null> {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = await verify(token, process.env.JWT_SECRET!);
    return Number(payload.sub);
  } catch {
    return null;
  }
}

app
  // 친구 목록 조회 (전체 목록)
  .get('/', async (c) => {
    const userId = await getUserIdFromToken(c);
    if (!userId) return c.text('Unauthorized', 401);

    const results = await db
      .select({ id: userTable.id, username: userTable.username, image: userTable.image })
      .from(friendsTable)
      .innerJoin(userTable, eq(friendsTable.friendId, userTable.id))
      .where(eq(friendsTable.userId, userId));

    return c.json({ friends: results });
  })

  // 친구 추가
  .post('/', zValidator('json', z.object({ friendUsername: z.string() })), async (c) => {
    const userId = await getUserIdFromToken(c);
    if (!userId) return c.text('Unauthorized', 401);

    const { friendUsername: raw } = c.req.valid('json');
    const friendUsername = raw.trim();

    const [friend] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, friendUsername));

    if (!friend) return c.text('해당 ID의 친구를 찾을 수 없습니다', 404);
    if (friend.id === userId) return c.text("You can't add yourself", 400);

    await db.insert(friendsTable).values({
      userId,
      friendId: friend.id,
    });

    return c.text('Friend added');
  })

  // 친구 삭제
  .delete('/:friendId', async (c) => {
    const userId = await getUserIdFromToken(c);
    if (!userId) return c.text('Unauthorized', 401);

    const friendId = Number(c.req.param('friendId'));
    await db
      .delete(friendsTable)
      .where(and(eq(friendsTable.userId, userId), eq(friendsTable.friendId, friendId)));

    return c.text('Friend removed');
  })

  // 친구 상세 정보 조회 (비밀번호 제외)
  .get('/:friendId', async (c) => {
    const friendId = Number(c.req.param('friendId'));

    const [user] = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        image: userTable.image,
        motherLang: userTable.motherLang,
        targetLang: userTable.targetLang,
      })

      .from(userTable)
      .where(eq(userTable.id, friendId));

    if (!user) return c.text('User not found', 404);
    return c.json({ user });
  });

export default app;
