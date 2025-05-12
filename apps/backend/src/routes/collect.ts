import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';

import { zValidator } from '~/utils/validator-wrapper';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import type { Env } from '~/types/hono';
import { words } from '~/schemas';
import { db } from '~/utils/db';
import natural from 'natural';
import { inArray } from 'drizzle-orm';

const stemmer = natural.PorterStemmer;

const app = new Hono<Env>().post(
  '/',
  zValidator(
    'json',
    z.object({
      url: z.string(),
    }),
  ),
  async (c) => {
    const locale = c.get('locale');
    const data = c.req.valid('json');
    if (determineSiteType(data.url) === SiteType.Youtube) {
      const vttText = await getYoutubeSubtitle(locale, data.url);
      const lines = vttText.split('\n');
      const stemCount: Record<string, number> = {};

      for (const line of lines) {
        if (line.includes('-->') || line.startsWith('WEBVTT') || line.trim() === '') continue;

        const wordList = line.split(/\W+/).filter(Boolean);
        for (const w of wordList) {
          const stem = stemmer.stem(w.toLowerCase());
          stemCount[stem] = (stemCount[stem] || 0) + 1;
        }
      }

      await Promise.all(
        Object.entries(stemCount).map(async ([word, count]) => {
          try {
            await db.insert(words).values({
              word,
              meaning: '',
              count,
              level: 0,
            });
          } catch (e) {}
        }),
      );
      return c.json({ success: true, count: Object.keys(stemCount).length });
    }
    throw new HTTPException(400, { message: 'Invalid url' });
  },
);

app.get('/', async (c) => {
  const result = await db.select().from(words);
  return c.json(result);
});

app.post(
  '/delete',
  zValidator(
    'json',
    z.object({
      ids: z.array(z.number()),
    }),
  ),
  async (c) => {
    const { ids } = c.req.valid('json');
    await db.delete(words).where(inArray(words.id, ids));
    return c.json({ ok: true });
  },
);

export default app;
