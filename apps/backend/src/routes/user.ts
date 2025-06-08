import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { count, eq } from 'drizzle-orm';
import * as jdenticon from 'jdenticon';

import { userTable } from '~/schemas/user';
import { quizSetLogTable } from '~/schemas/quizSetLog';
import { zValidator } from '~/utils/validator-wrapper';
import { db } from '~/utils/db';
import type { Env } from '~/types/hono';
import { uploadFile } from '~/utils/upload';

const app = new Hono<Env>()
  .post(
    '/login',
    zValidator(
      'json',
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    ),
    async (c) => {
      const data = c.req.valid('json');
      try {
        const [user] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.username, data.username));
        if (!user || !(await Bun.password.verify(data.password, user.password))) {
          throw new Error();
        }
        return c.json({
          token: await sign(
            {
              sub: user.id,
              username: user.username,
              motherLang: user.motherLang,
              targetLang: user.targetLang,
            },
            process.env.JWT_SECRET!,
          ),
        });
      } catch (e) {}
      throw new HTTPException(404, { message: 'Not found user' });
    },
  )
  .post(
    '/signup',
    zValidator(
      'json',
      z.object({
        username: z.string(),
        password: z.string().min(8, 'must be at least 8 characters long'),
        motherLang: z.string(),
        targetLang: z.string(),
      }),
    ),
    async (c) => {
      const data = c.req.valid('json');
      const [alreadyExistUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.username, data.username));
      if (alreadyExistUser) {
        throw new HTTPException(400, { message: 'Already exists user' });
      }

      const bcryptHash = await Bun.password.hash(data.password, {
        algorithm: 'bcrypt',
        cost: 4,
      });

      const filename = await uploadFile(jdenticon.toPng(data.username, 200), '.png');

      await db.insert(userTable).values({
        username: data.username,
        password: bcryptHash,
        motherLang: data.motherLang,
        targetLang: data.targetLang,
        image: `/uploads/${filename}`,
      });
      const [user] = await db.select().from(userTable).where(eq(userTable.username, data.username));
      if (!user) {
        throw new HTTPException(500);
      }
      return c.json({
        token: await sign(
          {
            sub: user.id,
            username: user.username,
            motherLang: user.motherLang,
            targetLang: user.targetLang,
          },
          process.env.JWT_SECRET!,
        ),
      });
    },
  )
  .get('/me', async (c) => {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, c.get('userId')));
    if (!user) {
      throw new HTTPException(404, { message: 'Not found user' });
    }
    const { count: quizCount } = (
      await db
        .select({ count: count() })
        .from(quizSetLogTable)
        .where(eq(quizSetLogTable.userId, user.id))
    )[0]!;
    return c.json({
      user,
      quizCount,
      token: await sign(
        {
          sub: user.id,
          username: user.username,
          motherLang: user.motherLang,
          targetLang: user.targetLang,
        },
        process.env.JWT_SECRET!,
      ),
    });
  })

  // 비밀번호 변경(mypage)
  .put(
    '/me/password',
    zValidator(
      'json',
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }),
    ),
    async (c) => {
      const userId = c.get('userId');
      const { currentPassword, newPassword } = c.req.valid('json');

      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, Number(userId)));

      if (!user) return c.text('User not found', 404);

      const isMatch = await Bun.password.verify(currentPassword, user.password);
      if (!isMatch) return c.text('현재 비밀번호가 일치하지 않습니다', 403);

      const hashed = await Bun.password.hash(newPassword, {
        algorithm: 'bcrypt',
        cost: 4,
      });

      await db
        .update(userTable)
        .set({ password: hashed })
        .where(eq(userTable.id, Number(userId)));

      return c.text('비밀번호가 성공적으로 변경되었습니다');
    },
  )

  .put('/me/image', zValidator('json', z.object({ imageUrl: z.string() })), async (c) => {
    const userId = c.get('userId');
    const { imageUrl } = c.req.valid('json');
    await db
      .update(userTable)
      .set({ image: imageUrl })
      .where(eq(userTable.id, Number(userId)));
    return c.json({ success: true });
  });

export default app;
