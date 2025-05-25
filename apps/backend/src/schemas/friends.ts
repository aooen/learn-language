import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { userTable } from './user';

export const friendsTable = mysqlTable(
  'friends',
  {
    userId: int()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),

    friendId: int()
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: [table.userId, table.friendId],
  }),
);
