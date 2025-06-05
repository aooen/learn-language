import { char, int, mysqlTable, varchar, primaryKey } from 'drizzle-orm/mysql-core';

export const corpusTable = mysqlTable(
  'corpus',
  {
    language: char({ length: 5 }).notNull(),
    word: varchar({ length: 100 }).notNull(),
    ranking: int().unique().notNull(),
  },
  (table) => [primaryKey({ columns: [table.language, table.word] })],
);
