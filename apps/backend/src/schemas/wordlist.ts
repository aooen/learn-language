import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';
import { userTable } from './user';

export const wordlistTable = mysqlTable('wordlist', {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  userId: int()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  sourceType: varchar({ length: 20 }),
  sourceUrl: varchar({ length: 1024 }),
});
