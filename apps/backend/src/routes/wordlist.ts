import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { worklist } from '~/schemas';
import type { Env } from '~/types/hono';
import { db } from '~/utils/db';

const app = new Hono<Env>()
  .get('/', async (c) => {
    const rows = await db.select().from(worklist).where(eq(worklist.id, '123123'));
    return c.json({
      wordlist: rows,
    });
  })
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        id: z.string(),
        dsof: z.number(),
      }),
    ),
    async (c) => {
      const data = c.req.valid('json');
      await db.insert(worklist).values({ id: data.id, dsof: data.dsof });
      return c.json({ ok: true });
    },
  );

export default app;
