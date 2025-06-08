import { char, mysqlTable, varchar, primaryKey } from 'drizzle-orm/mysql-core';

export const cacheStemTable = mysqlTable(
  'cacheStem',
  {
    language: char({ length: 5 }).notNull(),
    word: varchar({ length: 255 }).notNull(),
    stem: varchar({ length: 255 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.language, table.word] })],
);
