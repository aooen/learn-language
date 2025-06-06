import natural from 'natural';
import { WebVTTParser } from 'webvtt-parser';

const stemmer = natural.PorterStemmer;

export async function parseWebVTT(vttContent: string) {
  const parser = new WebVTTParser();
  const result = parser.parse(vttContent);

  const subtitles = result.cues.map((cue) => ({
    startTime: Math.floor(cue.startTime * 1000),
    endTime: Math.floor(cue.endTime * 1000),
    subtitle: cue.text,
  }));

  const stemCount: Record<string, number> = {};
  for (let cue of result.cues) {
    const wordList = cue.text.split(/\W+/).filter(Boolean);
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
  }

  return {
    subtitles,
    stemCount,
  };
}
