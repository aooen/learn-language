import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config(); // .env 불러오기

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
export const db = drizzle(connection);
