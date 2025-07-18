import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as cheerio from 'cheerio';
import { and, desc, eq, gt, sql, type InferInsertModel } from 'drizzle-orm';
import { z } from 'zod';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';
import { getYoutubeId } from '@learn-language/shared/utils/youtube';

import { zValidator } from '~/utils/validator-wrapper';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import type { Env } from '~/types/hono';
import { wordTable } from '~/schemas/word';
import { wordlistTable } from '~/schemas/wordlist';
import { db } from '~/utils/db';
import { getWordFrequencies } from '~/utils/corpus';
import { requestTranslation, requestMeaning } from '~/utils/llm';
import { parseWebVTT } from '~/utils/subtitle';
import { countStem } from '~/utils/stem';
import { subtitleTable } from '~/schemas/subtitle';
import { collectingTable } from '~/schemas/collecting';

const app = new Hono<Env>()
  .get('/', async (c) => {
    const userId = c.get('userId');
    const collecting = await db
      .select()
      .from(collectingTable)
      .where(
        and(
          eq(collectingTable.userId, userId),
          gt(collectingTable.createdAt, sql`DATE_SUB(NOW(), INTERVAL 1 HOUR)`),
        ),
      )
      .orderBy(desc(collectingTable.createdAt));
    return c.json({ collecting });
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const collectingId = c.req.param('id');
    const [{ affectedRows }] = await db
      .delete(collectingTable)
      .where(and(eq(collectingTable.id, Number(collectingId)), eq(collectingTable.userId, userId)));
    return c.json({ success: affectedRows > 0 });
  })
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        url: z.string().optional(),
        text: z.string().optional(),
      }),
    ),
    async (c) => {
      const locale = c.get('locale');
      const userId = c.get('userId');
      const data = c.req.valid('json');

      const [{ insertId: collectingId }] = await db.insert(collectingTable).values({
        title: '',
        source: data.text ?? data.url ?? '',
        userId,
      });

      const updateCollectingState = async (
        change: Partial<InferInsertModel<typeof collectingTable>>,
      ) => {
        await db.update(collectingTable).set(change).where(eq(collectingTable.id, collectingId));
      };

      return await db.transaction(async (tx) => {
        if (data.text) {
          const title =
            data.text.length > 50 ? data.text.replace('\n', ' ').slice(0, 50) + '...' : data.text;

          await updateCollectingState({ title });

          const [{ insertId: wordlistId }] = await tx.insert(wordlistTable).values({
            title,
            userId,
            sourceType: 'text',
          });

          const stemCount = await countStem(data.text);
          if (Object.keys(stemCount).length === 0) {
            await updateCollectingState({ error: "It seems not 'en-US' media" });
            throw new HTTPException(400, { message: "It seems not 'en-US' media" });
          }

          const meaningMap = await requestMeaning(Object.keys(stemCount));
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

          if (affectedRows > 0) {
            await updateCollectingState({ progress: '1.00', wordlistId });
            return c.json({ success: true, wordlistId, count: affectedRows });
          }

          tx.rollback();
        } else if (data.url) {
          const res = await fetch(data.url);
          const html = await res.text();
          const $ = cheerio.load(html);
          const title = $('title').text();

          const sourceType = determineSiteType(data.url);

          await updateCollectingState({ title });

          const [{ insertId: wordlistId }] = await tx.insert(wordlistTable).values({
            title,
            userId,
            sourceType,
            sourceUrl: data.url,
          });

          if (sourceType === SiteType.Youtube) {
            let vttText = '';
            try {
              vttText = await getYoutubeSubtitle(locale, getYoutubeId(data.url));
            } catch (e) {
              await updateCollectingState({ error: "There is no 'en-US' subtitle in the media" });
              throw new HTTPException(400, {
                message: "There is no 'en-US' subtitle in the media",
              });
            }

            const subtitles = parseWebVTT(vttText);
            const stemCount = await countStem(subtitles.map((s) => s.subtitle));

            await updateCollectingState({ progress: '0.33' });

            let koSubtitles: string[] = await requestTranslation(
              subtitles.map(({ subtitle }) => subtitle),
            );

            await tx.insert(subtitleTable).values(
              subtitles.map((subtitle, index) => ({
                ...subtitle,
                wordlistId,
                koSubtitle: koSubtitles[index] ?? '',
              })),
            );

            await updateCollectingState({ progress: '0.66' });

            const meaningMap = await requestMeaning(Object.keys(stemCount));
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

            if (affectedRows > 0) {
              await updateCollectingState({ progress: '1.00', wordlistId });
              return c.json({ success: true, wordlistId, count: affectedRows });
            }
          }

          tx.rollback();
        }

        await updateCollectingState({ error: 'Invalid collecting target' });
        throw new HTTPException(400, { message: 'Invalid collecting target' });
      });
    },
  );

export default app;
