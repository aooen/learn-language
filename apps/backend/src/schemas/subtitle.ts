import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { media } from './media';

export const subtitle = mysqlTable('subtitle', {
  sid: int().primaryKey().autoincrement(),
  mediaId: int()
    .references(() => media.id)
    .notNull(),
  startTime: int().notNull(),
  endTime: int().notNull(),
  subtitle: varchar({ length: 200 }).notNull(),
});
