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
  koSubtitle: varchar({ length: 1024 }).notNull(), //한글 뜻을 출력할 부분
});
//wordlistTable이랑 조인하고 특정한 word