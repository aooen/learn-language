import { binary, char, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const word = mysqlTable('word', {
  id: int().primaryKey().autoincrement(),
  word: varchar({ length: 255 }).notNull(),
  meaning: varchar({ length: 255 }).notNull(),
  count: int().notNull(),
  frequency: int().notNull(),
  wordlistId: int().notNull(),
});
