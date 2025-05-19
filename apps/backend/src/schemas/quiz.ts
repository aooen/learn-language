import { double, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { quizSetTable } from './quizSet';

export const quizTable = mysqlTable('quiz', {
  id: int().primaryKey().autoincrement(),
  front: varchar({ length: 500 }).notNull(),
  back: varchar({ length: 500 }).notNull(),
  progress: double().notNull(),
  sentenceFrom: varchar({ length: 500 }).notNull(),
  due: int().notNull(),
  quizSetId: int()
    .references(() => quizSetTable.id, { onDelete: 'cascade' })
    .notNull(),
});
