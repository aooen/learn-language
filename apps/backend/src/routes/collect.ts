import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';

import { zValidator } from '~/utils/validator-wrapper';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import type { Env } from '~/types/hono';
import { wordTable } from '~/schemas/word';
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
        Object.entries(stemCount).map(async ([stem, count]) => {
          try {
            await db.insert(wordTable).values({
              word: stem,
              meaning: '',
              count,
              frequency: 0,
              wordlistId: 1,
            });
          } catch (e) {}
        }),
      );
      return c.json({ success: true, count: Object.keys(stemCount).length });
    }
    throw new HTTPException(400, { message: 'Invalid url' });
  },
);

export default app;
