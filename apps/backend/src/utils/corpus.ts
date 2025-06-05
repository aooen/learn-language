import { and, count, eq, inArray } from 'drizzle-orm';
import * as path from 'path';
import { corpusTable } from '~/schemas/corpus';
import { db } from './db';

const corpusFolderName = path.resolve(__dirname, '../../', 'vendors/corpus');

export async function prepareDatabase() {
  const { count: corpusRowCount } = (await db.select({ count: count() }).from(corpusTable))[0]!;
  if (corpusRowCount > 0) {
    return;
  }
  const file = Bun.file(path.join(corpusFolderName, 'frequency.txt'));
  const text = await file.text();
  const words = text.split('\n');

  // drizzle can insert not too many records one time
  for (let i = 0; i <= words.length / 10000; i++) {
    await db
      .insert(corpusTable)
      .ignore()
      .values(
        words.slice(i * 10000, (i + 1) * 10000).map((word, index) => ({
          language: 'en-US',
          word,
          ranking: i * 10000 + index + 1,
        })),
      );
  }
}

export async function getWordFrequencies(language: string, words: string[]) {
  const data = await db
    .select()
    .from(corpusTable)
    .where(and(eq(corpusTable.language, language), inArray(corpusTable.word, words)));
  const map: Record<string, number> = {};
  data.forEach((row) => {
    map[row.word] = Math.max(1 - row.ranking / 10000, 0);
  });
  return map;
}
