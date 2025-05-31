import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as cheerio from 'cheerio';
import natural from 'natural';
import { z } from 'zod';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';

import { zValidator } from '~/utils/validator-wrapper';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import type { Env } from '~/types/hono';
import { wordTable } from '~/schemas/word';
import { wordlistTable } from '~/schemas/wordlist';
import { db } from '~/utils/db';
import { crawlMeanings } from '~/crawler/daum-dict';

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
    const userId = c.get('userId');
    const data = c.req.valid('json');

    const res = await fetch(data.url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text();

    const sourceType = determineSiteType(data.url);

    const [{ insertId: wordlistId }] = await db.insert(wordlistTable).values({
      title,
      userId,
      sourceType,
      sourceUrl: data.url,
    });

    if (sourceType === SiteType.Youtube) {
      const vttText = await getYoutubeSubtitle(locale, data.url);
      const lines = vttText.split('\n');
      const stemCount: Record<string, number> = {};

      for (const line of lines) {
        if (line.includes('-->') || line.startsWith('WEBVTT') || line.trim() === '') continue;

        const wordList = line.split(/\W+/).filter(Boolean);
        for (const w of wordList) {
          const lower = w.toLowerCase().trim();
          // 유효하지 않은 단어 스킵
          if (!/^[a-zA-Z]{2,}$/.test(lower)) {
            continue;
          }

          const stem = stemmer.stem(lower);
          stemCount[stem] = (stemCount[stem] || 0) + 1;
        }
      }

      const stemWords = Object.keys(stemCount);
      const filteredWords = stemWords.filter((w) => /^[a-zA-Z]{2,}$/.test(w));

      console.log('🟡 stemWords:', stemWords);
      console.log('🌐 Daum 크롤링 시작...');
      const meaningMap = await crawlMeanings(filteredWords);
      console.log('✅ Daum 크롤링 완료:', Object.keys(meaningMap).length);

      const unknowns = filteredWords.filter((w) => meaningMap[w] == null);
      if (unknowns.length > 0) {
        console.warn('⚠️ 뜻을 찾지 못한 단어들:', unknowns);
      }

      await db.insert(wordTable).values(
        filteredWords.map((stem): typeof wordTable.$inferInsert => ({
          word: stem,
          meaning: meaningMap[stem],
          count: stemCount[stem] ?? 0,
          frequency: 0,
          wordlistId,
        })),
      );
      return c.json({ success: true, wordlistId, count: filteredWords.length });
    }
    throw new HTTPException(400, { message: 'Invalid url' });
  },
);

export default app;
