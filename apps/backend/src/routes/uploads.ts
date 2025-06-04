import { Hono } from 'hono';
import * as path from 'path';
import type { Env } from '../types/hono.ts';
import { uploadFile } from '~/utils/upload.ts';

const app = new Hono<Env>().post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    return c.text('No file uploaded', 400);
  }

  const extension = path.extname(file.name);
  const filename = await uploadFile(file, extension);

  return c.json({ url: `/uploads/${filename}` });
});

export default app;
