import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { wordlistTable } from './wordlist';

export const subtitleTable = mysqlTable('subtitle', {
  id: int().primaryKey().autoincrement(),
  wordlistId: int()
    .references(() => wordlistTable.id, { onDelete: 'cascade' })
    .notNull(),
  startTime: int().notNull(),
  endTime: int().notNull(),
  subtitle: varchar({ length: 1024 }).notNull(),
});
