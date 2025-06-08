import { decimal, int, varchar, text, timestamp, mysqlTable } from 'drizzle-orm/mysql-core';
import { userTable } from './user';

export const collectingTable = mysqlTable('collecting', {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }),
  progress: decimal({ precision: 3, scale: 2 }).default('0.00').notNull(),
  source: text().notNull(),
  error: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
  userId: int()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  wordlistId: int(), // do not referencing here because wordlist is made inner transition
});
