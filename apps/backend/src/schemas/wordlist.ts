import { binary, char, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const worklist = mysqlTable('worklist', {
  id: varchar({ length: 50 }).notNull(),
  dsof: int().notNull(),
});
