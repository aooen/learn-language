import { char, mysqlTable, varchar, primaryKey } from 'drizzle-orm/mysql-core';

export const cacheTranslateTable = mysqlTable(
  'cacheTranslate',
  {
    language: char({ length: 5 }).notNull(),
    line: varchar({ length: 512 }).notNull(),
    translateLanguage: char({ length: 5 }).notNull(),
    translated: varchar({ length: 512 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.language, table.line, table.translateLanguage] })],
);
