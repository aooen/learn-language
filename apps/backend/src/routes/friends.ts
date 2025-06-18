import { Hono } from 'hono';
import { eq, and, count, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/utils/db';
import { friendsTable } from '~/schemas/friends';
import { userTable } from '~/schemas/user';
import { quizSetLogTable } from '~/schemas/quizSetLog';
import { zValidator } from '~/utils/validator-wrapper';
import type { Env } from '../types/hono.ts';

const app = new Hono<Env>()
  // 친구 목록 조회 (전체 목록)
  .get('/', async (c) => {
    const userId = c.get('userId');

    const friends = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        image: userTable.image,
        isRequesting: friendsTable.isRequesting,
      })
      .from(friendsTable)
      .innerJoin(userTable, eq(friendsTable.friendId, userTable.id))
      .where(eq(friendsTable.userId, userId));

    const requesters = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        image: userTable.image,
      })
      .from(friendsTable)
      .innerJoin(userTable, eq(friendsTable.userId, userTable.id))
      .where(and(eq(friendsTable.friendId, userId), eq(friendsTable.isRequesting, true)));

    return c.json({ friends, requesters });
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
      isRequesting: true,
    });

    return c.json({ success: affectedRows > 0 });
  })

  // 친구 수락
  .post('/accept', zValidator('json', z.object({ requesterId: z.string() })), async (c) => {
    const userId = c.get('userId');
    const { requesterId } = c.req.valid('json');

    const [{ affectedRows }] = await db
      .update(friendsTable)
      .set({ isRequesting: false })
      .where(and(eq(friendsTable.userId, Number(requesterId)), eq(friendsTable.friendId, userId)));

    if (affectedRows > 0) {
      await db.insert(friendsTable).values({
        userId,
        friendId: Number(requesterId),
        isRequesting: false,
      });
    }

    return c.json({ success: affectedRows > 0 });
  })

  // 친구 삭제
  .delete('/:friendId', async (c) => {
    const userId = c.get('userId');
    const friendId = Number(c.req.param('friendId'));
    const [{ affectedRows }] = await db
      .delete(friendsTable)
      .where(
        or(
          and(eq(friendsTable.userId, userId), eq(friendsTable.friendId, friendId)),
          and(eq(friendsTable.userId, friendId), eq(friendsTable.friendId, userId)),
        ),
      );

    return c.json({ success: affectedRows > 0 });
  })

  // 친구 상세 정보 조회 (비밀번호 제외)
  .get('/:friendId', async (c) => {
    const friendId = Number(c.req.param('friendId'));

    const { count: friendshipRowCount } = (
      await db
        .select({ count: count() })
        .from(friendsTable)
        .where(and(eq(friendsTable.friendId, friendId), eq(friendsTable.isRequesting, false)))
    )[0]!;

    if (friendshipRowCount === 0) {
      return c.text('User not found', 404);
    }

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

    const { count: quizCount } = (
      await db
        .select({ count: count() })
        .from(quizSetLogTable)
        .where(eq(quizSetLogTable.userId, user.id))
    )[0]!;
    return c.json({
      user,
      quizCount,
    });
  });

export default app;
