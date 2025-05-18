import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '~/utils/validator-wrapper';
import { word } from '~/schemas/word';
import { db } from '~/utils/db';
import { inArray } from 'drizzle-orm';
import type { Env } from '~/types/hono';

const app = new Hono<Env>()
  .get('/', async (c) => {
    const result = await db.select().from(word);
    return c.json(result);
  })
  .post(
    '/delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number()),
      }),
    ),
    async (c) => {
      const { ids } = c.req.valid('json');
      await db.delete(word).where(inArray(word.id, ids));
      return c.json({ ok: true });
    },
  );

export default app;
