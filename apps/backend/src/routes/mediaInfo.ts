import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Hono } from 'hono';
import type { Env } from '~/types/hono';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';
import { HTTPException } from 'hono/http-exception';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import { db } from '~/utils/db';
import { subtitleTable } from '~/schemas/subtitle'
import { wordlistTable } from '~/schemas/wordlist';
import { eq } from 'drizzle-orm';



type Caption = { start: number; end: number; text: string; koText: string; };

const parseWEBVTT = (input: string): Caption[] => {
  const captions: Caption[] = [];
  const lines = input.split('\n');
  let currentCaption: Partial<Caption> = {};

  for (let line of lines) {
    line = line.trim();

    if (line.includes('-->')) {
      // 시간 처리
      const parts = line.split('-->').map((s) => s.trim());
      if (parts[0] && parts[1]) {
        currentCaption.start = timeToSeconds(parts[0]);
        currentCaption.end = timeToSeconds(parts[1]);
      }
    } else if (
      line &&
      !line.startsWith('WEBVTT') &&
      !line.startsWith('Kind:') &&
      !line.startsWith('Language:')
    ) {
      // 텍스트 처리
      currentCaption.text = currentCaption.text ? `${currentCaption.text}\n${line}` : line;
      
      //임시 한글 자막 처리
      currentCaption.koText = '[한글 자막 출력 부분]';

    } else if (!line) {
      // 빈 줄에서 캡션 완성
      if (
        currentCaption.text &&
        currentCaption.start !== undefined &&
        currentCaption.end !== undefined
      ) {
        captions.push(currentCaption as Caption);
        currentCaption = {};
      }
    }
  }

  // 마지막 캡션 처리
  if (
    currentCaption.text &&
    currentCaption.start !== undefined &&
    currentCaption.end !== undefined
  ) {
    captions.push(currentCaption as Caption);
  }  
  
  return captions;
};

const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':');
  const lastPart = parts[parts.length - 1]?.split('.') ?? ['0', '0'];
  let seconds = 0;

  if (parts.length === 3 && parts[0] && parts[1]) {
    seconds += parseInt(parts[0], 10) * 3600;
    seconds += parseInt(parts[1], 10) * 60;
    seconds += parseInt(lastPart[0] || '0');
    seconds += parseFloat(`0.${lastPart[1] || '0'}`);
  } else if (parts.length === 2 && parts[0]) {
    seconds += parseInt(parts[0], 10) * 60;
    seconds += parseInt(lastPart[0] || '0');
    seconds += parseFloat(`0.${lastPart[1] || '0'}`);
  }

  return seconds;
};

const app = new Hono<Env>().post(
  '/',
  zValidator(
    'json',
    z.object({
      fullUrl: z.string(),
    }),
  ),
  async (c) => {
    const locale = c.get('locale');
    const data = c.req.valid('json');



     //db에서 자막을 가져올 경우
      // let enSubtitle = await db.select({start: subtitleTable.startTime, end: subtitleTable.endTime, text: subtitleTable.subtitle, koText: subtitleTable.koSubtitle})
      // .from(subtitleTable)
      // .innerJoin(wordlistTable, eq(subtitleTable.wordlistId,wordlistTable.id))
      // .where(eq(wordlistTable.sourceUrl,data.fullUrl));
      // return c.json(enSubtitle);
     
    if (determineSiteType(data.fullUrl) === SiteType.Youtube) {
      try {
        const subtitleText = await getYoutubeSubtitle(locale, data.fullUrl);
        
        const parsedSubtitles = parseWEBVTT(subtitleText);
        if (!parsedSubtitles.length) {
          throw new Error('자막을 찾을 수 없습니다.');
        }
        return c.json(parsedSubtitles);
      } catch (error: unknown) {
        console.error('자막 처리 오류:', error);
        throw new HTTPException(500, {
          message:
            error instanceof Error ? error.message : '자막을 처리하는 중 오류가 발생했습니다!',
        });
      }
    } else {
      throw new HTTPException(400, { message: '유효하지 않은 URL입니다!' });
    }
  },
);

export default app;
