import { JSDOM } from 'jsdom';
import { fetch } from 'undici';
import { setTimeout } from 'timers/promises';

// 단어 하나에 대해 Daum 사전에서 뜻을 크롤링
export async function crawlMeaning(word: string): Promise<string> {
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
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Daum 사전에서 뜻이 있는 부분 선택
    const results = Array.from(doc.querySelectorAll('.list_search .txt_search'))
      .map((el) => (el as HTMLElement).textContent?.trim())
      .filter((text): text is string => !!text);

    // 3개까지만 잘라서 join
    const trimmed = results.slice(0, 3).join(', ');
    return trimmed || '뜻 없음';
  } catch (err) {
    console.error(`[크롤링 실패: ${word}]`, err);
    return '뜻 없음';
  }
}

export async function crawlMeanings(words: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  for (const word of words) {
    try {
      result[word] = await crawlMeaning(word);
    } catch (err) {
      console.error(`❌ ${word} 뜻 가져오기 실패`, err);
      result[word] = '뜻 없음';
    }

    // Daum에서 너무 빨리 여러 요청 보내면 차단될 수 있으므로 딜레이 추가
    await setTimeout(300);
  }

  return result;
}
