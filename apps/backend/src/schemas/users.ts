import { binary, char, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: binary({ length: 60 }).notNull(),
  motherLang: char({ length: 5 }).notNull(),
  targetLang: char({ length: 5 }).notNull(),
});
