import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const media = mysqlTable('media', {
  id: int().primaryKey().autoincrement(),
  mediaLink: varchar({ length: 200 }).notNull().unique(),
  kind: varchar({ length: 10 }).notNull(),
});
