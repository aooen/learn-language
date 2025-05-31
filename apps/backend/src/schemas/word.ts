import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { wordlistTable } from './wordlist';

export const wordTable = mysqlTable('word', {
  id: int().primaryKey().autoincrement(),
  word: varchar({ length: 255 }).notNull(),
  meaning: varchar({ length: 255 }),
  count: int().notNull(),
  frequency: int().notNull(),
  wordlistId: int()
    .references(() => wordlistTable.id, { onDelete: 'cascade' })
    .notNull(),
});
