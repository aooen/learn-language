import { int, mysqlTable, datetime, double } from 'drizzle-orm/mysql-core';
import { quizSetTable } from './quizSet';
import { quizTable } from './quiz';
import { userTable } from './user';

export const quizSetLogTable = mysqlTable('quizSetLog', {
  id: int().primaryKey().autoincrement(),
  quizSetId: int()
    .references(() => quizSetTable.id, { onDelete: 'cascade' })
    .notNull(),
  studyDate: datetime().notNull(),
  learnedQuizId: int()
    .references(() => quizTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: int()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
});
