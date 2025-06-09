import { int, mysqlTable, datetime, double } from 'drizzle-orm/mysql-core';
import { userTable } from './user';

export const quizSetLogTable = mysqlTable('quizSetLog', {
  id: int().primaryKey().autoincrement(),
  quizSetId: int().notNull(),
  studyDate: datetime().notNull(),
  learnedQuizId: int().notNull(),
  userId: int()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
});
