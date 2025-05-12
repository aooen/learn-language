import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';
import { users } from './users';

export const wordlist = mysqlTable('wordlist', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
});
