import { char, mysqlTable, varchar, primaryKey } from 'drizzle-orm/mysql-core';

export const cacheMeaningTable = mysqlTable(
  'cacheMeaning',
  {
    language: char({ length: 5 }).notNull(),
    word: varchar({ length: 255 }).notNull(),
    meaningLanguage: char({ length: 5 }).notNull(),
    meaning: varchar({ length: 255 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.language, table.word, table.meaningLanguage] })],
);
