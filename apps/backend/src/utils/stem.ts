import natural from 'natural';

const stemmer = natural.PorterStemmer;

export function countStem(input: string | string[]) {
  const text = Array.isArray(input) ? input.join(' ') : input;

  const stemCount: Record<string, number> = {};
  const wordList = text.split(/\W+/).filter(Boolean);
  for (const w of wordList) {
    const cleaned = w
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase()
      .trim();

    const stem = stemmer.stem(cleaned);

    // 유효하지 않은 단어 스킵
    if (stem.length < 2) {
      continue;
    }

    stemCount[stem] = (stemCount[stem] || 0) + 1;
  }

  return stemCount;
}
