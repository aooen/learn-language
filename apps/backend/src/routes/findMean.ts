//다음 파일은 영단어의 한글 뜻(mean)을 찾아서 프론트로 리턴합니다.
import { Hono } from 'hono';
import type { Env } from '~/types/hono';
import { zValidator } from '~/utils/validator-wrapper';
import { z } from 'zod';
import { db } from '~/utils/db';
import { wordTable } from '~/schemas/word'
import { eq } from 'drizzle-orm';

const app = new Hono<Env>().post(
    '/',
    zValidator(
      'json',
      z.object({
        word: z.string(),
      }),
    ),
    async (c) => {
        const data = c.req.valid('json');
        let koMean = await db.select({koWord: wordTable.meaning, enWord: wordTable.word})
                             .from(wordTable)
                             .where(eq(wordTable.word,data.word));
    return c.json(koMean);
    }
);

export default app;