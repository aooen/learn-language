import { ZodSchema } from 'zod';
import type { ValidationTargets } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator as zv } from '@hono/zod-validator';

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, { cause: result.error });
    }
  });
