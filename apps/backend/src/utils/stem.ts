import { requestStemming } from './llm';

export function sanitizeWord(word: string) {
  return word
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
    .trim();
}

export async function countStem(input: string | string[]) {
  const text = Array.isArray(input) ? input.join(' ') : input;

  const stemCount: Record<string, number> = {};
  const wordList = text
    .split(/\W+/)
    .filter(Boolean)
    .map(sanitizeWord)
    .filter((w) => w.length >= 2);

  const wordSet = new Set(wordList);
  const stemmedWordList = await requestStemming([...wordSet.values()]);

  for (const w of wordList) {
    const stem = stemmedWordList[w];
    if (stem) {
      stemCount[stem] = (stemCount[stem] ?? 0) + 1;
    }
  }

  return stemCount;
}
