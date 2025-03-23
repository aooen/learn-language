import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';

import { zValidator } from '~/utils/validator-wrapper';
import { getYoutubeSubtitle } from '~/utils/ytdlp';
import type { Env } from '~/types/hono';

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
      return c.text(await getYoutubeSubtitle(locale, data.url));
    }
    throw new HTTPException(400, { message: 'Invalid url' });
  },
);

export default app;
