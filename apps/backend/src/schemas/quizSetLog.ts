import { int, mysqlTable, datetime, double } from 'drizzle-orm/mysql-core';
import { quizSetTable } from './quizSet';
import { quizTable } from './quiz';

export const quizSetLogTable = mysqlTable('quizSetLog', {
  id: int().primaryKey().autoincrement(),
  quizSetId: int()
    .references(() => quizSetTable.id, { onDelete: 'cascade' })
    .notNull(),
  study_date: datetime().notNull(),
  learned_quizId: int()
    .references(() => quizTable.id, { onDelete: 'cascade' })
    .notNull(),
});
