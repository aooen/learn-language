import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';

import { zValidator } from '~/utils/validator-wrapper';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import { crawlMeanings } from '~/crawler/daum-dict';
import type { Env } from '~/types/hono';
import { wordTable } from '~/schemas/word';
import { wordlistTable } from '~/schemas/wordlist';
import { db } from '~/utils/db';
import { getWordFrequencies } from '~/utils/corpus';
import { parseWebVTT } from '~/utils/subtitle';
import { subtitleTable } from '~/schemas/subtitle';

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
    const userId = c.get('userId');
    const data = c.req.valid('json');

    const res = await fetch(data.url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text();

    const sourceType = determineSiteType(data.url);

    const { wordlistId, affectedRows } =
      (await db.transaction(async (tx) => {
        const [{ insertId: wordlistId }] = await tx.insert(wordlistTable).values({
          title,
          userId,
          sourceType,
          sourceUrl: data.url,
        });

        if (sourceType === SiteType.Youtube) {
          const vttText = await getYoutubeSubtitle(locale, data.url);
          const { subtitles, stemCount } = await parseWebVTT(vttText);

          await tx.insert(subtitleTable).values(
            subtitles.map((subtitle) => ({
              ...subtitle,
              wordlistId,
              koSubtitle: '',
            })),
          );

          const meaningMap = await crawlMeanings(Object.keys(stemCount));
          const frequencyMap = await getWordFrequencies(locale, Object.keys(stemCount));

          const [{ affectedRows }] = await tx.insert(wordTable).values(
            Object.entries(stemCount).map(([stem, count]) => ({
              word: stem,
              meaning: meaningMap[stem]?.slice(0, 250),
              count,
              frequency: frequencyMap[stem] ?? 0,
              wordlistId,
            })),
          );

          return {
            wordlistId,
            affectedRows,
          };
        }
      })) ?? {};

    if (typeof affectedRows === 'number' && affectedRows > 0) {
      return c.json({ success: true, wordlistId, count: affectedRows });
    }

    throw new HTTPException(400, { message: 'Invalid url' });
  },
);

export default app;
