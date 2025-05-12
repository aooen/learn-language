import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import * as schemas from '~/schemas';
import { zValidator } from '~/utils/validator-wrapper';
import { db } from '~/utils/db';
import type { Env } from '~/types/hono';

const app = new Hono<Env>().get(
  '/quizSet',
  zValidator(
    'json',
    z.object({
      quizSet: z.number(),
    }),
  ),
  async (c) => {
    const body = await c.req.json();
  },
);

export default app;
