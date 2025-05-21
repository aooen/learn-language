import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { userTable } from '~/schemas/user';
import { zValidator } from '~/utils/validator-wrapper';
import { db } from '~/utils/db';
import type { Env } from '~/types/hono';

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
      await db.insert(userTable).values({
        username: data.username,
        password: bcryptHash,
        motherLang: data.motherLang,
        targetLang: data.targetLang,
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
    return c.json({
      user,
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
  });

export default app;
