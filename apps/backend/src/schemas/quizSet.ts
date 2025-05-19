import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { wordlistTable } from './wordlist';

export const quizSetTable = mysqlTable('quizSet', {
  id: int().primaryKey().autoincrement(),
  wordlistId: int()
    .references(() => wordlistTable.id, { onDelete: 'cascade' })
    .notNull(),
  maker: int(),
});
