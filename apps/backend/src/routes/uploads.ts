import { Hono } from 'hono';
import { mkdirSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { Env } from '../types/hono.ts';

const UPLOAD_DIR = 'uploads';
mkdirSync(UPLOAD_DIR, { recursive: true });

const app = new Hono<Env>().post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    return c.text('No file uploaded', 400);
  }

  const extension = extname(file.name);
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  writeFileSync(`${UPLOAD_DIR}/${filename}`, buffer);

  return c.json({ url: `/uploads/${filename}` });
});

export default app;
