import { double, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const quiz = mysqlTable('quiz', {
  id: int().primaryKey().autoincrement(),
  front: varchar({ length: 500 }).notNull(),
  back: varchar({ length: 500 }).notNull(),
  progress: double().notNull(),
  sentence_from: varchar({ length: 500 }).notNull(),
  due: int().notNull(),
  quizSet: int().notNull(),
});

export const quizSet = mysqlTable('quizSet', {
  id: int().primaryKey().autoincrement(),
  wordList: int().notNull(),
  maker: int(),
});
