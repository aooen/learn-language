import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '~/utils/db';
import { friendsTable } from '~/schemas/friends';
import { userTable } from '~/schemas/user';
import { zValidator } from '~/utils/validator-wrapper';
import { eq, and } from 'drizzle-orm';
import type { Env } from '../types/hono.ts';

const app = new Hono<Env>()
  // 친구 목록 조회 (전체 목록)
  .get('/', async (c) => {
    const userId = c.get('userId');
    const results = await db
      .select({ id: userTable.id, username: userTable.username, image: userTable.image })
      .from(friendsTable)
      .innerJoin(userTable, eq(friendsTable.friendId, userTable.id))
      .where(eq(friendsTable.userId, userId));

    return c.json({ friends: results });
  })

  // 친구 추가
  .post('/', zValidator('json', z.object({ friendUsername: z.string() })), async (c) => {
    const userId = c.get('userId');
    const { friendUsername: raw } = c.req.valid('json');
    const friendUsername = raw.trim();

    const [friend] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, friendUsername));

    if (!friend)
      return c.json({ success: false, message: '해당 ID의 친구를 찾을 수 없습니다' }, 404);
    if (friend.id === userId)
      return c.json({ success: false, message: '자신을 친구로 추가할 수 없습니다' }, 400);

    const [{ affectedRows }] = await db.insert(friendsTable).values({
      userId,
      friendId: friend.id,
    });

    return c.json({ success: affectedRows > 0 });
  })

  // 친구 삭제
  .delete('/:friendId', async (c) => {
    const userId = c.get('userId');
    const friendId = Number(c.req.param('friendId'));
    const [{ affectedRows }] = await db
      .delete(friendsTable)
      .where(and(eq(friendsTable.userId, userId), eq(friendsTable.friendId, friendId)));

    return c.json({ success: affectedRows > 0 });
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
