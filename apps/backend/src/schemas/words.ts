import { binary, char, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const words = mysqlTable('words', {
  id: int().primaryKey().autoincrement(),
  word: varchar({ length: 255 }).notNull().unique(),
  meaning: varchar({ length: 255 }).notNull(),
  count: int().notNull(),
  level: int().notNull(),
});
