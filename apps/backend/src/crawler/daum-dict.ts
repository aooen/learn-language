import { fetch } from 'undici';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

// 단어 하나에 대해 Daum 사전에서 뜻을 크롤링
export async function crawlMeaning1(word: string): Promise<string | null> {
  try {
    const res = await fetch(`https://dic.daum.net/search.do?q=${encodeURIComponent(word)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Daum 사전에서 뜻이 있는 부분 선택
    const results = $('.list_search .txt_search')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // 3개까지만 잘라서 join
    return results.length > 0 ? results.slice(0, 3).join(', ') : null;
  } catch (err) {
    console.error(`[1차 크롤링 실패: ${word}]`);
    return null;
  }
}

async function crawlMeaning2(word: string): Promise<string | null> {
  try {
    const res = await fetch(`https://dic.daum.net/search.do?q=${encodeURIComponent(word)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
      },
    });

    if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const results = $('.list_search .txt_search')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    return results.length > 0 ? results.slice(0, 3).join(', ') : null;
  } catch (err) {
    console.error(`[2차 크롤링 실패: ${word}]`);
    return null;
  }
}

export async function crawlMeanings(words: string[]): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  const limit = pLimit(3);

  const tasks = words.map((word) =>
    limit(async () => {
      const meaning = await crawlMeaning1(word);
      result[word] = meaning;
      await new Promise((r) => setTimeout(r, 700));
    }),
  );
  await Promise.all(tasks);

  const failedWords = Object.entries(result)
    .filter(([_, meaning]) => meaning === null)
    .map(([word]) => word);

  if (failedWords.length > 0) {
    console.log(` 2차 크롤링 시도: ${failedWords.length} 단어`);

    for (const word of failedWords) {
      const meaning = await crawlMeaning2(word);
      result[word] = meaning;
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return result;
}
